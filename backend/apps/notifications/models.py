from django.db import models

class Notification(models.Model):
    EMAIL = 'email'
    SMS   = 'sms'
    TYPE_CHOICES = [(EMAIL,'Email'),(SMS,'SMS')]
    user       = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    notif_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=EMAIL)
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-created_at']
