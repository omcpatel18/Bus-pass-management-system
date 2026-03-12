"""BusPassPro - Main URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView as SpectacularSwaggerUIView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/',         include('apps.users.urls')),
    path('api/v1/passes/',       include('apps.passes.urls')),
    path('api/v1/payments/',     include('apps.payments.urls')),
    path('api/v1/buses/',        include('apps.buses.urls')),
    path('api/v1/ai/',           include('apps.ai_engine.urls')),
    path('api/v1/notifications/',include('apps.notifications.urls')),

    # API Docs
    path('api/schema/',  SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',    SpectacularSwaggerUIView.as_view(url_name='schema'), name='swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
