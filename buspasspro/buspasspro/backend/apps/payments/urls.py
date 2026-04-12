from django.urls import path
from .views import (
    CreateOrderView, 
    VerifyPaymentView, 
    MarkPaymentFailedView,
    RefundPaymentView, 
    PaymentHistoryView, 
    AdminPaymentDashboardView
)

urlpatterns = [
    path('create-order/', CreateOrderView.as_view(),  name='create_order'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify_payment'),
    path('mark-failed/', MarkPaymentFailedView.as_view(), name='mark_failed_payment'),
    path('refund/', RefundPaymentView.as_view(), name='refund_payment'),
    path('history/', PaymentHistoryView.as_view(), name='payment_history'),
    path('admin/all/', AdminPaymentDashboardView.as_view(), name='admin_payments_all'),
]
