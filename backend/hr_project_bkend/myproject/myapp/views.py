from django.shortcuts import render, redirect
from .models import Item , UserLogin ,OpenJob ,\
JobStatus, ClientDetails, Candidate, DocumentDetails, DocumentStatus
from .forms import LoginForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from .auth_backend import UserLoginBackend  # Import your custom backend
import logging
from datetime import datetime
from django.db.models import Count
from django.db import connection
from .google_drive import upload_to_drive  # Import the Google Drive upload function
import os
from django.db.models import F, Q
from rest_framework.decorators import api_view
from rest_framework.response import Response

import io
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

logger = logging.getLogger(__name__)
UPLOAD_DIR = os.path.join("uploads")  # Define uploads directory

SERVICE_ACCOUNT_FILE=r"G:\BITS\Semester4\Project_related_file\hr-platform-dissertation-d697ee293a66.json"  # Update with your service account file


SCOPES = ["https://www.googleapis.com/auth/drive.file"]

# Google Drive folder where files will be uploaded
FOLDER_ID = "11J6Vtt_e6cUq0-C-DfSVLQtsyb9IH5DE"

# Authenticate with Google Drive API
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
drive_service = build("drive", "v3", credentials=credentials)

def item_list(request):
    items = Item.objects.all()
    return render(request, 'myapp/item_list.html', {'items': items})

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            backend = UserLoginBackend()
            user = backend.authenticate(request, username=username, password=password)

            if user:
                return JsonResponse({'message': 'Login Successful', 'client_id': user.client_id, 'usertype': user.usertype})
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except Exception as e:
            logger.error(f"Login error: {str(e)}")  # Log error details
            return JsonResponse({'error': 'Internal server error'}, status=500)


# def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            print(f"Attempting login with username: {username} and password: {password}")  # Debug line
            
            try:
                user = UserLogin.objects.get(username=username, password=password)
                # Redirect to the next page after successful login
                return redirect('success_page')  # Replace with your success page URL
            except UserLogin.DoesNotExist:
                form.add_error(None, 'Invalid username or password.')
    else:
        form = LoginForm()

    return render(request, 'myapp/login.html', {'form': form})

def success_view(request):
    return render(request, 'myapp/success.html')  # Create a success.html template

@csrf_exempt
def save_job(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print(data.get("role_title"))
            role_title = data.get("role_title")
            job_description = data.get("job_description")
            client_id = data.get("client_id")
            username = data.get("username")  # Received from React
            status = 'Open'
            # candidate_id = data.get("username")  # Received from React It needs to be null

            # Generate job_id
            last_job = OpenJob.objects.order_by('-creation_date').first()
            if last_job and last_job.job_id.startswith("jb_"):
                last_number = int(last_job.job_id.split("_")[1])  
                new_job_id = f"jb_{last_number + 1}"  
            else:
                new_job_id = "jb_1"

             # Save new job
            OpenJob.objects.create(job_id=new_job_id, role_title=role_title, 
                                   job_description=job_description, client_id=client_id,
                                   username=username, status=status)
            
            JobStatus.objects.create(job_id=new_job_id, stage_status={"Application Received": None, "Shortlisted": None, "Interview Scheduled": None, "Client Review": None, "Offer Extended": None, "Hired": None})

            return JsonResponse({"success": True, "message": "Job saved successfully."})
        except Exception as e:
            logger.error(f"Job error: {str(e)}")
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Invalid request method"})

@csrf_exempt
def job_list(request, client_id=None, usertype=None):
    try:
        if usertype == "Employee":
            jobs = OpenJob.objects.filter(status="Open")
        elif usertype != "Employee" and client_id:
            jobs = OpenJob.objects.filter(client_id=client_id).filter(status="Open")  

        if jobs.exists():
            job_list = list(jobs.values("job_id", "role_title", "job_description", "client_id", "username"))
            job_ids = [str(job["job_id"]) for job in job_list]  # Ensure job_id is string
            
            print(f"Fetched Job IDs: {job_ids}")  

            if not job_ids:  
                return JsonResponse([], safe=False)

            # Fetch candidates that match job IDs
            candidates = list(
                Candidate.objects.filter(job_id__in=job_ids)  # Removed client_id filter for debugging
                .values("job_id", "candidate_name", "cv_file_name")
            )
            print(f"Fetched Candidates: {candidates}")  

            # Convert candidates to a job_id → candidate map
            candidate_map = {}
            for cand in candidates:
                job_id_str = str(cand["job_id"])  # Ensure matching format
                candidate_map[job_id_str] = cand

            logger.info(f"Candidate Map: {candidate_map}")  

            # Merge candidate details into job listings
            for job in job_list:
                job_id_str = str(job["job_id"])
                candidate_data = candidate_map.get(job_id_str, {})
                job["candidate_name"] = candidate_data.get("candidate_name", "N/A")
                job["cv_file_name"] = candidate_data.get("cv_file_name", "")

            logger.info(f"Final Job Data: {job_list}")  

            return JsonResponse(job_list, safe=False)
        else:
            return JsonResponse({'error': 'No jobs found for this client'}, status=404)
    except Exception as e:
        logger.error(f"Job error: {str(e)}")  
        return JsonResponse({'error': 'Internal server error'}, status=500)

def get_status(request, job_id):
    status = get_object_or_404(JobStatus, job_id=job_id)
    return JsonResponse({
        "job_id": status.job_id,
        "stage_status": status.stage_status
    })

@csrf_exempt
def updates_status(request, job_id):
    if request.method == "POST":

        data = json.loads(request.body)
        # job_id = data.get("job_id")
        stage_status = data.get("stage_status")
        if not stage_status:
                return JsonResponse({"error": "Missing status field"}, status=400)
        print(stage_status)
        try:
            job = JobStatus.objects.get(job_id=job_id)
            job.stage_status = stage_status
            job.save()
            
            if stage_status.get('Hired')== 'Yes':
                candidate_dtls = Candidate.objects.get(job_id=job_id)
                candidate_dtls.selection_status = 'Hired'
                candidate_dtls.save()

                open_jb_dtls = OpenJob.objects.get(job_id=job_id)
                open_jb_dtls.status = 'Close'
                open_jb_dtls.save()

            return JsonResponse({"message": "Status updated successfully"}, status=200)
        except JobStatus.DoesNotExist:
            return JsonResponse({"error": "Job not found"}, status=404)
        except Exception as e:
            print(f"Database Error: {e}")
            return JsonResponse({"error": "Internal Server Error"}, status=500)

        # print(job_id, stage_status)
        # status = get_object_or_404(JobStatus, job_id=job_id)
        # status.stage_status = stage_status
        # status.save()

        # return JsonResponse({"success": True, "message": "Status updated successfully!"})

def dashboard_data(request):
    # Count of open jobs
    open_job_count = OpenJob.objects.filter(status="Open").count()

    # Job status breakdown (grouping by status)
    job_status_counts = OpenJob.objects.values("status").annotate(count=Count("status"))
    job_status_dict = {entry["status"]: entry["count"] for entry in job_status_counts}
    
    try:
        # Fetch fulfilled jobs from job_status JSON field
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    to_char(creation_date, 'Month') AS month, 
                    COUNT(*) 
                FROM job_status 
                WHERE stage_status->>'Hired' = 'Yes' 
                GROUP BY month 
                ORDER BY MIN(creation_date)
            """)
            fulfilled_by_month = [{"month": row[0].strip(), "count": row[1]} for row in cursor.fetchall()]

        # JSON response
        return JsonResponse({
            "open_job": open_job_count,
            "job_status": job_status_dict,
            "fulfilledByMonth": fulfilled_by_month
        })
    except Exception as e:
            logger.error(f"Job error: {str(e)}")
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Invalid request method"})

def get_clients(request):
    clients = ClientDetails.objects.all().values("client_id", "client_name", "company_name", "email", "phone", "status")
    return JsonResponse({"clients": list(clients)}, safe=False)

# @require_GET  # Ensures only GET requests are allowed
def get_client_ids(request):
    clients = list(ClientDetails.objects.values("client_id", "client_name"))  # Fetch required fields
    return JsonResponse({"clients": clients}, safe=False)

def get_users(request):
    users = UserLogin.objects.all().values("username", "usertype", "client_id", "company_name", "status")
    return JsonResponse({"users": list(users)}, safe=False)

# Fetch Candidates
def get_candidates(request):
    candidates = list(Candidate.objects.filter(Q(client_id="") | Q(client_id=None)).values())  
    return JsonResponse(candidates, safe=False)

def get_open_jobs(request):
    jobs = list(OpenJob.objects.filter(candidate_id=None).values())
    return JsonResponse(jobs, safe=False)

def get_open_jobs_with_candidates(request, client_id):
    # Fetch open jobs for the given client
    jobs = list(
        OpenJob.objects.filter(client_id=client_id)
        .exclude(candidate_id=None)
        .values("job_id", "role_title", "job_description", "client_id")
    )

    job_ids = [str(job["job_id"]) for job in jobs]  # Convert to string to avoid mismatches
    logger.info(f"Fetched job IDs: {job_ids}")  # Log job IDs

    if not job_ids:  # If no job IDs found, return empty response early
        return JsonResponse([], safe=False)

    # Fetch candidates who match the job IDs and client_id
    candidates = list(
        Candidate.objects.filter(job_id__in=job_ids, client_id=client_id).values(
            "job_id", "candidate_name", "cv_file_name"
        )
    )
    logger.info(f"Fetched candidates: {candidates}")  # Log candidate data

    # Convert to a dictionary mapping job_id → candidate details
    candidate_map = {str(cand["job_id"]): cand for cand in candidates}
    logger.info(f"Candidate Map: {candidate_map}")  # Log the candidate map

    # Merge candidate details into job listings
    for job in jobs:
        job_id_str = str(job["job_id"])
        job["candidate_name"] = candidate_map.get(job_id_str, {}).get("candidate_name", "N/A")
        job["cv_file_name"] = candidate_map.get(job_id_str, {}).get("cv_file_name", "")

    logger.info(f"Final job data: {jobs}")  # Log final job data before returning

    return JsonResponse(jobs, safe=False)
    # jobs = (
    #     OpenJob.objects.filter(client_id=client_id)
    #     .exclude(candidate_id=None)  # Only get jobs that have candidates assigned
    #     .values(
    #         "job_id",
    #         "role_title",
    #         "job_description",
    #         "client_id",
    #         candidate_name=F("candidate__candidate_name"),
    #         cv_file_name=F("candidate__cv_file_name"),
    #     )
    # )

    # return JsonResponse(list(jobs), safe=False)

@csrf_exempt
def register_candidate(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("Received Data:", data)

            required_fields = ["candidate_name", "role", "email", "phone","cv_file_name"]
            missing_fields = [field for field in required_fields if field not in data]

            if missing_fields:
                return JsonResponse({"error": f"Missing fields: {', '.join(missing_fields)}"}, status=400)
            
            # Ensure unique email and phone
            if Candidate.objects.filter(email=data["email"]).exists():
                return JsonResponse({"error": "Email already exists"}, status=400)
            if Candidate.objects.filter(phone=data["phone"]).exists():
                return JsonResponse({"error": "Phone number already exists"}, status=400)


            # Generate candidate_id
            last_cand = Candidate.objects.order_by('-creation_date').first()
            if last_cand and last_cand.candidate_id.startswith("cd_"):
                last_number = int(last_cand.candidate_id.split("_")[1])  
                new_cand_id = f"cd_{last_number + 1}"  
            else:
                new_cand_id = "cd_1"
            candidate_id = new_cand_id  # Generate a unique candidate_id
            candidate = Candidate.objects.create(
                candidate_id=candidate_id,
                candidate_name=data["candidate_name"],
                role=data["role"],
                location=data.get("location", ""),
                email=data["email"],
                phone=data["phone"],
                selection_status="Applied",  # Default status
                cv_file_name=data["cv_file_name"],  # Default status
            )
            print(f"candidate_id: {candidate.candidate_id, candidate.cv_file_name}")
            return JsonResponse({"success": True, "candidate_id": candidate.candidate_id})
        except Exception as e:
            print(f"candidate_id1: {candidate.candidate_id, candidate.cv_file_name}")
            return JsonResponse({"success": False, "error": str(e)}, status=400)
    print(f"candidate_id1: {candidate.candidate_id, candidate.cv_file_name}")
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def update_client_id(request, candidate_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            candidate = Candidate.objects.get(candidate_id=candidate_id)
            candidate.client_id = data["client_id"]
            candidate.job_id = data["job_id"]
            candidate.save()

            job = OpenJob.objects.get(job_id=data["job_id"])
            job.candidate_id = candidate_id
            job.save()

            jobStat = JobStatus.objects.get(job_id=data["job_id"])
            jobStat.stage_status={"Application Received": "Yes", "Shortlisted": "Yes", "Interview Scheduled": None, "Client Review": None, "Offer Extended": None, "Hired": None}
            jobStat.save()

            return JsonResponse({"message": "Client ID updated successfully!"}, status=200)
        except Candidate.DoesNotExist:
            return JsonResponse({"error": "Candidate not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def assign_candidate_to_job(request, job_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            job = OpenJob.objects.get(job_id=job_id)
            job.candidate_id = data["candidate_id"]
            job.save()
            return JsonResponse({"message": "Candidate assigned to job successfully!"}, status=200)
        except OpenJob.DoesNotExist:
            return JsonResponse({"error": "Job not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def upload_cv(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=400)

    if "file" not in request.FILES:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    try:
        file = request.FILES["file"]
        print(file)
        file_name = file.name

        # Ensure "uploads" directory exists
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)  # Create directory if not exists

        file_path = os.path.join(UPLOAD_DIR, file_name)

        # Save file temporarily
        with default_storage.open(file_path, "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        logger.info(f"File {file_name} saved locally at {file_path}")

        # Upload to Google Drive
        drive_file_id = upload_to_drive(file_path, file_name)
        logger.info(f"File {file_name} uploaded to Google Drive with ID {drive_file_id}")

        # Clean up local storage
        os.remove(file_path)

        return JsonResponse({"message": "CV uploaded successfully!", "file_id": drive_file_id})

    except Exception as e:
        logger.error(f"Upload error: {e}")
        return JsonResponse({"error": "Internal server error", "details": str(e)}, status=500)
    
@csrf_exempt
def download_cv(request, job_id):
    try:
        # Log the received job_id
        logger.info(f"Received request to download CV for job_id: {job_id}")

        # Get the candidate details based on job_id
        candidate = Candidate.objects.get(job_id=job_id)

        # Log candidate details
        logger.info(f"Candidate found: {candidate.candidate_name}, CV File ID: {candidate.cv_file_name}")

        # Get the Google Drive File ID (Ensure `cv_file_name` contains the correct ID)
        cv_file_id = candidate.cv_file_name
        if not cv_file_id:
            logger.warning(f"No CV found for job_id: {job_id}")
            return JsonResponse({"error": "CV file not found for this candidate."}, status=404)

        # Construct Google Drive direct download URL
        file_url = f"https://drive.google.com/uc?export=download&id={cv_file_id}"
        logger.info(f"Redirecting to: {file_url}")

        return redirect(file_url)

    except Candidate.DoesNotExist:
        logger.error(f"Candidate not found for job_id: {job_id}")
        return JsonResponse({"error": "Candidate not found for this job ID."}, status=404)

    except Exception as e:
        logger.exception(f"Error downloading CV for job_id: {job_id}: {e}")
        return JsonResponse({"error": "An error occurred while processing the request."}, status=500)
    
@csrf_exempt  # Temporarily disable CSRF for debugging
def save_document_status(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))  # Ensure decoding is correct
            print("Received Data:", data)  # Debugging print statement

            # Validate required fields
            required_fields = ["client_id", "status", "doc_store_id"]
            for field in required_fields:
                if field not in data:
                    return JsonResponse({"success": False, "error": f"Missing field: {field}"}, status=400)

            # Generate new `status_id`
            last_stat = DocumentStatus.objects.order_by('-creation_date').first()
            if last_stat and last_stat.status_id.startswith("stat_"):
                last_number = int(last_stat.status_id.split("_")[1])  
                new_stat_id = f"stat_{last_number + 1}"  
            else:
                new_stat_id = "stat_1"
            
            doc_id = DocumentDetails.objects.get(document_type=data["document_id"])
            print(doc_id)
            

            # Create a new document status record
            doc_status = DocumentStatus.objects.create(
                status_id=new_stat_id,
                client_id=data["client_id"],
                document_id=doc_id,
                candidate_id=data.get("candidate_id", None),  # Ensure candidate_id can be null
                status=data["status"],
                doc_store_id=data["doc_store_id"],
            )

            print(f"Created DocumentStatus: {doc_status.status_id}")  # Debugging print

            return JsonResponse({"success": True, "status_id": new_stat_id})

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON format"}, status=400)
        except Exception as e:
            print("Error:", str(e))  # Debugging print
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    return JsonResponse({"success": False, "error": "Invalid request method"}, status=405)

@csrf_exempt
def get_client_documents(request, client_id):
    if request.method == "GET":
        print("client_id:", client_id)
        docs = list(
            DocumentStatus.objects.filter(client_id=client_id and document_id != 'doc_1')
            .values("status_id", "document_id", "status", "doc_store_id")
        )
        print("Fetched from DB:", docs)  # 👈 Add this line to confirm DB results
        return JsonResponse({"documents": docs}, safe=False)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def replace_signed_document(request):
    if request.method == "POST":
        file = request.FILES.get("file")
        old_file_id = request.POST.get("old_doc_store_id")

        if not file or not old_file_id:
            return JsonResponse({"success": False, "error": "Missing data"}, status=400)

        try:
            # 1. Delete old file
            drive_service.files().delete(fileId=old_file_id).execute()

            # 2. Upload new file
            file_metadata = {"name": file.name, "parents": [FOLDER_ID]}
            media = MediaIoBaseUpload(io.BytesIO(file.read()), mimetype=file.content_type)
            uploaded_file = drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields="id"
            ).execute()

            new_file_id = uploaded_file.get("id")
            # new_file_id = upload_to_drive(FOLDER_ID, file.name)

            # 3. Update your DB
            DocumentStatus.objects.filter(doc_store_id=old_file_id).update(
                doc_store_id=new_file_id,
                status="Approved"
            )

            return JsonResponse({"success": True, "file_id": new_file_id})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@api_view(['GET'])
def get_document_status(request):
    client_id = request.GET.get('client_id')
    if not client_id:
        return Response({'error': 'Missing client_id'}, status=400)

    try:
        documents = DocumentStatus.objects.filter(client_id=client_id).filter(candidate_id__isnull=True)

        data = []
        for doc in documents:
            # Fetch candidate by candidate_id
            client = ClientDetails.objects.get(client_id=doc.client_id)
            jb = DocumentDetails.objects.get(document_id=doc.document_id)
            
            # Add the document details and related candidate data
            data.append({
                'document_id': doc.document_id,
                'document_name': jb.document_type,
                'status': doc.status,
                'Client_name': client.client_name,  # Fetch candidate name from Candidate model
                'Client_status': client.status  # Fetch job status from Candidate model
            })


        # data = [{
        #     'document_id': doc.document_id,
        #     'status': doc.status
        # } for doc in documents]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['GET'])
def get_document_status_candidate(request):
    try:
        # Retrieve all DocumentStatus records where candidate_id is not null
        documents = DocumentStatus.objects.filter(candidate_id__isnull=False)
        
        data = []
        for doc in documents:
            # Fetch candidate by candidate_id
            candidate = Candidate.objects.get(candidate_id=doc.candidate_id)
            jb = DocumentDetails.objects.get(document_id=doc.document_id)
            
            # Add the document details and related candidate data
            data.append({
                'document_id': doc.document_id,
                'document_name': jb.document_type,
                'status': doc.status,
                'candidate_name': candidate.candidate_name,  # Fetch candidate name from Candidate model
                'job_status': candidate.selection_status  # Fetch job status from Candidate model
            })
        
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_hired_candidates(request):
    try:
        documents = Candidate.objects.filter(selection_status='Hired')
        data = []

        for doc in documents:
            data.append({
                'candidate_id': doc.candidate_id,
                'candidate_name': doc.candidate_name,
                'client_id': doc.client_id if doc.client_id else None,
                'job_id': doc.job_id 
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def get_upload_contract(request):
    try:
        candidate_id = request.POST.get('candidate_id')
        client_id = request.POST.get('client_id')
        job_id = request.POST.get('job_id')
        file = request.FILES.get('file')
        if not candidate_id or not file:
            return Response({'success': False, 'message': 'Missing candidate_id or file'}, status=400)

        print(file, client_id, candidate_id, job_id)
        file_name = file.name

        # Ensure "uploads" directory exists
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)  # Create directory if not exists

        file_path = os.path.join(UPLOAD_DIR, file_name)

        # Save file temporarily
        with default_storage.open(file_path, "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        logger.info(f"File {file_name} saved locally at {file_path}")

        # Upload to Google Drive
        drive_file_id = upload_to_drive(file_path, file_name)
        logger.info(f"File {file_name} uploaded to Google Drive with ID {drive_file_id}")

        # Save document status record
        # Generate new `status_id`
        last_stat = DocumentStatus.objects.order_by('-creation_date').first()
        if last_stat and last_stat.status_id.startswith("stat_"):
            last_number = int(last_stat.status_id.split("_")[1])  
            new_stat_id = f"stat_{last_number + 1}"  
        else:
            new_stat_id = "stat_1"

        # Save to DocumentStatus:
        DocumentStatus.objects.create(
            status_id=new_stat_id,
            candidate_id=candidate_id,
            client_id=client_id,
            document_id='doc_1',
            doc_store_id=drive_file_id,
            status='Pending'
        )

         # Clean up local storage
        os.remove(file_path)

        return Response({'success': True, 'file_id': drive_file_id})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)

@api_view(['GET'])
def get_candidate_contracts(request):
    client_id = request.GET.get('client_id')
    print("Client ID received:", client_id)

    try:
        candidates = DocumentStatus.objects.filter(candidate_id=client_id).values(
            'status_id', 'document_id', 'doc_store_id', 'status'
        )
        print("Candidates found:", candidates)
        return Response({"candidates": list(candidates)}, status=200)

    except Exception as e:
        print("Error fetching candidates:", str(e))
        import traceback
        traceback.print_exc()
        return Response({"error": "Server error"}, status=500)
    