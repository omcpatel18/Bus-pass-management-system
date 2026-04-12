from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from smtplib import SMTPAuthenticationError
from .models import Notification

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([AllowAny]) # In production, this should be IsAdminUser
def send_email_summary(request):
    try:
        data = request.data
        period = data.get('period', 'monthly')
        d = data.get('data', {})
        email_to = data.get('email_to', 'xyzmnb96@gmail.com')

        subject = f"BusPassPro - {period.title()} Summary Report"
        
        message = f"""
        Dear Admin,
        
        Here is the {period} summary report for BusPassPro Transit System:
        
        Period: {period.title()}
        Passes Issued: {d.get('passes', 0)}
        Total Revenue: {d.get('revenue', '0')}
        New Students: {d.get('newStudents', 0)}
        Top Route: {d.get('topRoute', 'N/A')}
        Total Scans: {d.get('scans', 0)}
        Pending Applications: {d.get('pending', 0)}
        
        This is an automated system generated email.
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER or settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email_to],
            fail_silently=False,
        )

        return Response({"success": True, "message": "Email sent successfully"})
    except SMTPAuthenticationError:
        return Response(
            {
                "error": "SMTP authentication failed. Verify EMAIL_HOST_USER, app password, and provider security settings.",
            },
            status=500,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=500)
