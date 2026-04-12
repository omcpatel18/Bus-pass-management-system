from django.contrib import admin
from .models import Payment, Refund

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'currency', 'purpose', 'status', 'created_at')
    list_filter = ('status', 'purpose', 'created_at')
    search_fields = ('id', 'razorpay_order_id', 'razorpay_payment_id', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('id', 'payment', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'razorpay_refund_id', 'payment__id')
    readonly_fields = ('id', 'created_at')
