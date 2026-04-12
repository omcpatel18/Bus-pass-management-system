from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudentProfile, OTPVerification

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('email', 'role', 'is_verified', 'is_active', 'created_at')
    list_filter   = ('role', 'is_verified', 'is_active')
    search_fields = ('email',)
    ordering      = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Info', {'fields': ('phone', 'role', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = ((None, {'classes': ('wide',), 'fields': ('email', 'password1', 'password2', 'role')}),)

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display  = ('full_name', 'student_id', 'department', 'college_name')
    search_fields = ('full_name', 'student_id')

admin.site.register(OTPVerification)
