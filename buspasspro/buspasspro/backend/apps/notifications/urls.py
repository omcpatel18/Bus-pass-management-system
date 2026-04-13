from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification_list'),
    path('mark-all-read/', views.NotificationMarkAllReadView.as_view(), name='notification_mark_all_read'),
    path('<int:pk>/mark-read/', views.NotificationMarkReadView.as_view(), name='notification_mark_read'),
    path('<int:pk>/', views.NotificationDeleteView.as_view(), name='notification_delete'),
    path('broadcast/', views.BroadcastNotificationView.as_view(), name='notification_broadcast'),
    path('email-summary/', views.send_email_summary, name='email_summary'),
]
