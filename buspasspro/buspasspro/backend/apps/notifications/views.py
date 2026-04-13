from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from smtplib import SMTPAuthenticationError
from apps.users.models import User
from .models import Notification
from .serializers import NotificationSerializer, BroadcastNotificationSerializer

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not notif.is_read:
            notif.is_read = True
            notif.save(update_fields=['is_read'])

        return Response({'message': 'Notification marked as read.'})


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.', 'updated': updated})


class NotificationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        deleted, _ = Notification.objects.filter(pk=pk, user=request.user).delete()
        if not deleted:
            return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BroadcastNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not (getattr(user, 'role', None) == User.ADMIN or user.is_staff or user.is_superuser):
            return Response({'error': 'Only admins can send broadcasts.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BroadcastNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Broadcast target is passengers (students) per product requirement.
        recipients = User.objects.filter(is_active=True, role=User.STUDENT)

        payload = [
            Notification(
                user=recipient,
                title=data['title'],
                message=data['message'],
                notif_type=data['notif_type'],
                is_read=False,
            )
            for recipient in recipients
        ]

        Notification.objects.bulk_create(payload)
        return Response({
            'message': 'Broadcast sent successfully.',
            'recipients': len(payload),
            'audience': data['audience'],
        }, status=status.HTTP_201_CREATED)

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
