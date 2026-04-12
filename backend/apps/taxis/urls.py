from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaxiViewSet, TaxiBookingViewSet

router = DefaultRouter()
router.register(r'taxis', TaxiViewSet, basename='taxi')
router.register(r'bookings', TaxiBookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
]
