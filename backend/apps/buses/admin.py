from django.contrib import admin
from .models import Bus, BusLocation, BusSchedule

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display  = ('bus_number', 'route', 'driver_name', 'capacity', 'is_active')
    list_editable = ('is_active',)

@admin.register(BusLocation)
class BusLocationAdmin(admin.ModelAdmin):
    list_display = ('bus', 'latitude', 'longitude', 'speed_kmh', 'timestamp')
    list_filter  = ('bus',)

admin.site.register(BusSchedule)
