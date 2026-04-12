from django.contrib import admin
from .models import Taxi, TaxiLocation, TaxiBooking


@admin.register(Taxi)
class TaxiAdmin(admin.ModelAdmin):
    list_display = ('driver_name', 'vehicle_number', 'vehicle_type', 'rating', 'is_active')
    list_filter = ('is_active', 'vehicle_type', 'created_at')
    search_fields = ('driver_name', 'driver_phone', 'vehicle_number')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TaxiLocation)
class TaxiLocationAdmin(admin.ModelAdmin):
    list_display = ('taxi', 'latitude', 'longitude', 'is_available', 'timestamp')
    list_filter = ('is_available', 'timestamp')
    search_fields = ('taxi__vehicle_number', 'stop_name')
    readonly_fields = ('timestamp',)


@admin.register(TaxiBooking)
class TaxiBookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'taxi', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('student__email', 'taxi__vehicle_number')
    readonly_fields = ('created_at', 'updated_at')
