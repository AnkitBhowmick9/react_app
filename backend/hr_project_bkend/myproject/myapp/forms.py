from django import forms

class LoginForm(forms.Form):
    username = forms.CharField(max_length=100, label='Username')
    password = forms.CharField(widget=forms.PasswordInput, label='Password')