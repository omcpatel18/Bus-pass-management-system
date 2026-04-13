from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'notif_type', 'is_read', 'created_at')


class BroadcastNotificationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    audience = serializers.ChoiceField(choices=('ALL', 'STUDENTS'), default='ALL')
    notif_type = serializers.ChoiceField(choices=(Notification.EMAIL, Notification.SMS), default=Notification.EMAIL)
