from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name
    
class UserLogin(models.Model):
    username = models.CharField(max_length=20)
    password = models.TextField()
    usertype = models.CharField(max_length=10, null=True, blank=True)
    client_id = models.CharField(max_length=10, null=True, blank=True)
    company_name = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=10, choices=[('Active', 'Active'), ('Inactive', 'Inactive')])
    creation_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_login'  # Specify existing table name

    def __str__(self):
        return self.username
    
class CompanyDetails(models.Model):
    employee_id = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)
    employee_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=100)
    status = models.CharField(max_length=50, choices=[('Active', 'Active'), ('Inactive', 'Inactive')])
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    creation_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'company_details'  # Specify existing table name

    def save(self, *args, **kwargs):
        """Auto-generate employee_id in the format emp_1, emp_2, emp_3..."""
        if not self.employee_id:  # Only generate ID if it's a new record
            last_employeeId = CompanyDetails.objects.order_by('-creation_date').first()
            if last_employeeId and last_employeeId.employee_id.startswith("emp_"):
                last_number = int(last_employeeId.employee_id.split("_")[1])  # Extract the numeric part
                self.last_employeeId = f"emp_{last_number + 1}"  # Increment the number
            else:
                self.last_employeeId = "emp_1"  # First record
        super().save(*args, **kwargs)  # Call the original save method

    def __str__(self):
        return f"{self.employee_name} - {self.designation}"
    
class ClientDetails(models.Model):
    client_id = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)
    client_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=100)
    description = models.TextField()
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    status = models.CharField(max_length=50, choices=[('Active', 'Active'), ('Inactive', 'Inactive')])
    creation_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'client_details'  # Specify existing table name
    
    def save(self, *args, **kwargs):
        """Auto-generate client_id in the format cl_1, cl_2, cl_3..."""
        if not self.client_id:  # Only generate ID if it's a new record
            last_clientId = ClientDetails.objects.order_by('-creation_date').first()
            if last_clientId and last_clientId.client_id.startswith("cl_"):
                last_number = int(last_clientId.client_id.split("_")[1])  # Extract the numeric part
                self.last_clientId = f"cl_{last_number + 1}"  # Increment the number
            else:
                self.last_clientId = "cl_1"  # First record
        super().save(*args, **kwargs)  # Call the original save method

    def __str__(self):
        return f"{self.client_name} - {self.company_name}"

class DocumentDetails(models.Model):
    document_id = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)
    document_type = models.CharField(max_length=255)
    creation_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_details'  # Specify existing table name
    
    def save(self, *args, **kwargs):
        """Auto-generate status_id in the format stat_1, stat_2, stat_3..."""
        if not self.document_id:  # Only generate ID if it's a new record
            last_documentId = DocumentDetails.objects.order_by('-creation_date').first()
            if last_documentId and last_documentId.document_id.startswith("doc_"):
                last_number = int(last_documentId.document_id.split("_")[1])  # Extract the numeric part
                self.last_documentId = f"doc_{last_number + 1}"  # Increment the number
            else:
                self.last_documentId = "doc_1"  # First record
        super().save(*args, **kwargs)  # Call the original save method

    def __str__(self):
        return f"{self.document_id}"

class DocumentStatus(models.Model):
    status_id = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)
    client_id = models.CharField(max_length=10)
    document_id = models.CharField(max_length=10)
    candidate_id = models.CharField(max_length=10)
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')])
    creation_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'document_status'  # Specify existing table name
    
    def save(self, *args, **kwargs):
        """Auto-generate status_id in the format stat_1, stat_2, stat_3..."""
        if not self.status_id:  # Only generate ID if it's a new record
            last_statusId = DocumentStatus.objects.order_by('-creation_date').first()
            if last_statusId and last_statusId.status_id.startswith("stat_"):
                last_number = int(last_statusId.status_id.split("_")[1])  # Extract the numeric part
                self.last_statusId = f"stat_{last_number + 1}"  # Increment the number
            else:
                self.last_statusId = "stat_1"  # First record
        super().save(*args, **kwargs)  # Call the original save method

    def __str__(self):
        return f"{self.document_type} - {self.status}"
    
class Candidate(models.Model):
    candidate_id = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)
    candidate_name = models.CharField(max_length=255)
    job_id = models.CharField(max_length=10)
    client_id = models.CharField(max_length=10)
    role = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    selection_status = models.CharField(max_length=50, choices=[('Applied', 'Applied'), ('Shortlisted', 'Shortlisted'),
                                                                 ('Interview Scheduled','Interview Scheduled'),('Client Review','Client Review'),
                                                                   ('Hired', 'Hired'),( 'Rejected', 'Rejected')])
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    cv_file_name = models.CharField(max_length=15)
    creation_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_details'  # Specify existing table name

    def save(self, *args, **kwargs):
        """Auto-generate candidate_id in the format cd_1, cd_2, cd_3..."""
        if not self.candidate_id:  # Only generate ID if it's a new record
            last_candidateId = Candidate.objects.order_by('-creation_date').first()
            if last_candidateId and last_candidateId.candidate_id.startswith("cd_"):
                last_number = int(last_candidateId.candidate_id.split("_")[1])  # Extract the numeric part
                self.last_candidateId = f"cd_{last_number + 1}"  # Increment the number
            else:
                self.last_candidateId = "cd_1"  # First record
        super().save(*args, **kwargs)  # Call the original save method

    def __str__(self):
        return f"{self.candidate_name} - {self.role}"

class OpenJob(models.Model):
    job_id = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)  # Prevent manual edits
    role_title = models.CharField(max_length=255)
    job_description = models.TextField()
    client_id = models.CharField(max_length=10)
    username = models.CharField(max_length=100)  # Store the username from login
    candidate_id = models.CharField(max_length=10, null=True, blank=True)
    status = models.CharField(max_length=50, choices=[('Open', 'Open'), ('Not Required', 'Not Required'), ('Close', 'Close')])
    creation_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'open_job'  # Specify existing table name

    def save(self, *args, **kwargs):
        """Auto-generate job_id in the format jb_1, jb_2, jb_3..."""
        if not self.job_id:  # Only generate ID if it's a new record
            last_job = OpenJob.objects.order_by('-creation_date').first()
            if last_job and last_job.job_id.startswith("jb_"):
                last_number = int(last_job.job_id.split("_")[1])  # Extract the numeric part
                self.job_id = f"jb_{last_number + 1}"  # Increment the number
            else:
                self.job_id = "jb_1"  # First record
        super().save(*args, **kwargs)  # Call the original save method

    def __str__(self):
        return f"{self.job_id} - {self.role_title}"
    
class JobStatus(models.Model):
    job_id = models.CharField(max_length=10, unique=True, editable=False, primary_key=True)
    stage_status = models.JSONField(default=dict) 
   
    class Meta:
        db_table = 'job_status'
    
    def __str__(self):
        return f"{self.job_id}"
