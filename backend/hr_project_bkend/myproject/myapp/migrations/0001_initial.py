# Generated by Django 5.1.6 on 2025-03-14 15:28

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Candidate',
            fields=[
                ('candidate_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False, unique=True)),
                ('candidate_name', models.CharField(max_length=255)),
                ('job_id', models.CharField(max_length=10)),
                ('client_id', models.CharField(max_length=10)),
                ('role', models.CharField(max_length=100)),
                ('location', models.CharField(max_length=100)),
                ('selection_status', models.CharField(choices=[('Applied', 'Applied'), ('Shortlisted', 'Shortlisted'), ('Interview Scheduled', 'Interview Scheduled'), ('Client Review', 'Client Review'), ('Hired', 'Hired'), ('Rejected', 'Rejected')], max_length=50)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(max_length=15)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('last_updated_date', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'candidate_details',
            },
        ),
        migrations.CreateModel(
            name='ClientDetails',
            fields=[
                ('client_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False, unique=True)),
                ('client_name', models.CharField(max_length=255)),
                ('company_name', models.CharField(max_length=255)),
                ('designation', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(max_length=15)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive')], max_length=50)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('last_updated_date', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'client_details',
            },
        ),
        migrations.CreateModel(
            name='CompanyDetails',
            fields=[
                ('employee_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False, unique=True)),
                ('employee_name', models.CharField(max_length=255)),
                ('designation', models.CharField(max_length=100)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive')], max_length=50)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(max_length=15)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('last_updated_date', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'company_details',
            },
        ),
        migrations.CreateModel(
            name='DocumentDetails',
            fields=[
                ('document_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False, unique=True)),
                ('document_type', models.CharField(max_length=255)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('last_updated_date', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'document_details',
            },
        ),
        migrations.CreateModel(
            name='DocumentStatus',
            fields=[
                ('status_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False, unique=True)),
                ('client_id', models.CharField(max_length=10)),
                ('document_id', models.CharField(max_length=10)),
                ('candidate_id', models.CharField(max_length=10)),
                ('status', models.CharField(choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')], max_length=50)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('last_updated_date', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'document_status',
            },
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='JobStatus',
            fields=[
                ('job_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False, unique=True)),
                ('stage_status', models.JSONField(default=dict)),
            ],
            options={
                'db_table': 'job_status',
            },
        ),
        migrations.CreateModel(
            name='OpenJob',
            fields=[
                ('job_id', models.CharField(editable=False, max_length=10, primary_key=True, serialize=False, unique=True)),
                ('role_title', models.CharField(max_length=255)),
                ('job_description', models.TextField()),
                ('client_id', models.CharField(max_length=10)),
                ('username', models.CharField(max_length=100)),
                ('candidate_id', models.CharField(blank=True, max_length=10, null=True)),
                ('status', models.CharField(choices=[('Open', 'Open'), ('Not Required', 'Not Required'), ('Close', 'Close')], max_length=50)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('last_updated_date', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'open_job',
            },
        ),
        migrations.CreateModel(
            name='UserLogin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=20)),
                ('password', models.TextField()),
                ('usertype', models.CharField(blank=True, max_length=10, null=True)),
                ('client_id', models.CharField(blank=True, max_length=10, null=True)),
                ('company_name', models.CharField(blank=True, max_length=50, null=True)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive')], max_length=10)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('last_updated_date', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'user_login',
            },
        ),
    ]
