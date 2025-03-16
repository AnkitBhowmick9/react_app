from django.contrib import admin
from .models import Item, UserLogin, OpenJob , JobStatus,\
CompanyDetails, ClientDetails, DocumentDetails, Candidate

admin.site.register(Item)
admin.site.register(UserLogin)
admin.site.register(JobStatus)
admin.site.register(OpenJob)
admin.site.register(CompanyDetails)
admin.site.register(ClientDetails)
admin.site.register(DocumentDetails)
admin.site.register(Candidate)