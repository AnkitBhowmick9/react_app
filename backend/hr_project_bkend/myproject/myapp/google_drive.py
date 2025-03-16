from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account

# import googleapiclient
# print(googleapiclient.__version__)

# Load Google Service Account Credentials
SERVICE_ACCOUNT_FILE=r"G:\BITS\Semester4\Project_related_file\hr-platform-dissertation-d697ee293a66.json"  # Update with your service account file


SCOPES = ["https://www.googleapis.com/auth/drive.file"]

# Google Drive folder where files will be uploaded
FOLDER_ID = "11J6Vtt_e6cUq0-C-DfSVLQtsyb9IH5DE"

# Authenticate with Google Drive API
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
drive_service = build("drive", "v3", credentials=credentials)

def upload_to_drive(file_path, file_name):
    """Upload a file (PDF, Word, Excel) to Google Drive."""
    
    # Detect file type based on the extension
    mime_types = {
        "pdf": "application/pdf",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }

    file_extension = file_path.split(".")[-1].lower()  # Get file extension
    mime_type = mime_types.get(file_extension, "application/octet-stream")  # Default to binary if unknown

    file_metadata = {
        "name": file_name,
        "parents": [FOLDER_ID],
    }
    media = MediaFileUpload(file_path, mimetype=mime_type)

    file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id",
    ).execute()

    print(f"File uploaded successfully! File ID: {file.get('id')}")
    return file.get("id")

# Example Usage
if __name__ == "__main__":
    file_path = "example_cv.xlsx"  # Update with actual file path
    file_name = "candidate_cv.xlsx"
    upload_to_drive(file_path, file_name)
