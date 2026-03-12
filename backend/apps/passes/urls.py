"""Passes App - URL Patterns"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('routes',       views.RouteViewSet,          basename='route')
router.register('applications', views.PassApplicationViewSet, basename='application')
router.register('my-passes',    views.BusPassViewSet,         basename='buspass')

urlpatterns = [
    path('', include(router.urls)),
    path('scan/', views.QRScanView.as_view(), name='qr_scan'),
]
