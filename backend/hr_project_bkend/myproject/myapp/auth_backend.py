from django.contrib.auth.backends import BaseBackend
from django.shortcuts import get_object_or_404
from .models import UserLogin  # Import your custom model

class UserLoginBackend(BaseBackend):
    """
    Custom authentication backend to validate against user_login table.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Fetch user from `user_login` table
            user = UserLogin.objects.get(username=username, status="Active")

            # Here, passwords should ideally be hashed; for now, we're comparing plaintext
            if user.password == password:  # Change this to hashing for security
                return user  # Return user object if authentication is successful
        except UserLogin.DoesNotExist:
            return None  # Return None if user doesn't exist or is inactive

    def get_user(self, user_id):
        """
        Fetch user by ID (used internally by Django).
        """
        try:
            return UserLogin.objects.get(pk=user_id)
        except UserLogin.DoesNotExist:
            return None
