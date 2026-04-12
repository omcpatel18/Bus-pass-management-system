from django.urls import path
from . import views

urlpatterns = [
    path('email-summary/', views.send_email_summary, name='email_summary'),
]
