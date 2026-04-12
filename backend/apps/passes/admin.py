from django.contrib import admin
from .models import Route, PassApplication, BusPass, PassScanLog

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display  = ('name', 'source', 'destination', 'fare', 'is_active')
    list_editable = ('is_active',)

@admin.register(PassApplication)
class PassApplicationAdmin(admin.ModelAdmin):
    list_display  = ('id', 'student', 'route', 'duration_type', 'status', 'applied_at')
    list_filter   = ('status', 'duration_type')
    search_fields = ('student__email',)
    actions       = ['approve_applications']

    def approve_applications(self, request, queryset):
        queryset.filter(status='pending').update(status='approved')
    approve_applications.short_description = 'Approve selected applications'

@admin.register(BusPass)
class BusPassAdmin(admin.ModelAdmin):
    list_display = ('pass_number', 'status', 'valid_from', 'valid_until')
    list_filter  = ('status',)

admin.site.register(PassScanLog)
