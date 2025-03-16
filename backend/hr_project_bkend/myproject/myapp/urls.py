from django.urls import path
from .views import item_list ,login_view, \
success_view, save_job,job_list, get_status, \
update_status, dashboard_data, get_clients, \
get_users, get_candidates, get_open_jobs, register_candidate,\
update_client_id,assign_candidate_to_job, upload_cv, download_cv,\
get_client_ids

urlpatterns = [
    path('items/', item_list, name='item_list'),
    path('login/', login_view, name='login'),
    path('success/', success_view, name='success_page'),
    path('save-job/', save_job, name='save-job'),
    path('jobs/<str:client_id>/<str:usertype>/', job_list, name='job-list'),
    path('status/<str:job_id>/', get_status, name='get-status'),
    path('status/update/', update_status, name='update-status'),
    path('dashboard/', dashboard_data, name='dashboard'),
    path("get-clients/", get_clients, name="get-clients"),
    path("get_client_ids/", get_client_ids, name="get_client_ids"),
    path("get-users/", get_users, name="get-users"),
    path("candidates/", get_candidates, name="get_candidates"),
    path("open-jobs/", get_open_jobs, name="get_open_jobs"),
    path("register_candidate/", register_candidate, name="register_candidate"),
    path("candidate/<str:candidate_id>/update-client/", update_client_id, name="update_client_id"),
    path("open-jobs/<str:job_id>/assign-candidate/", assign_candidate_to_job, name="assign_candidate_to_job"),
    path("upload-cv/", upload_cv, name="upload_cv"),
    path("download-cv/<str:job_id>/", download_cv, name="download_cv"),

]