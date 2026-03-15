from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import F
from math import radians, cos, sin, asin, sqrt

from .models import Taxi, TaxiLocation, TaxiBooking
from .serializers import TaxiSerializer, TaxiLocationSerializer, TaxiBookingSerializer, TaxiBookingCreateSerializer


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r


class TaxiViewSet(viewsets.ModelViewSet):
    queryset = Taxi.objects.filter(is_active=True).prefetch_related('locations')
    serializer_class = TaxiSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='nearby')
    def get_nearby_taxis(self, request):
        """
        Get taxis near user's location.
        Query params: lat, lng, radius (in km, default=5)
        """
        try:
            user_lat = float(request.query_params.get('lat'))
            user_lng = float(request.query_params.get('lng'))
            radius = float(request.query_params.get('radius', 5))
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid coordinates or radius'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all active taxis with their latest locations
        taxis = Taxi.objects.filter(is_active=True).prefetch_related('locations')
        nearby_taxis = []

        for taxi in taxis:
            latest_location = taxi.locations.first()
            if latest_location and latest_location.is_available:
                distance = haversine_distance(
                    user_lat, user_lng,
                    latest_location.latitude, latest_location.longitude
                )
                if distance <= radius:
                    data = TaxiSerializer(taxi).data
                    data['distance_km'] = round(distance, 2)
                    data['eta_minutes'] = round((distance / 30) * 60)  # Assuming 30 km/h avg speed
                    nearby_taxis.append(data)

        # Sort by distance
        nearby_taxis.sort(key=lambda x: x['distance_km'])
        
        return Response({
            'count': len(nearby_taxis),
            'results': nearby_taxis
        })

    @action(detail=False, methods=['get'], url_path='locations')
    def get_taxi_locations(self, request):
        """Get latest locations of all active taxis"""
        locations = TaxiLocation.objects.filter(
            taxi__is_active=True,
            is_available=True
        ).select_related('taxi').order_by('-timestamp')[:100]
        
        serializer = TaxiLocationSerializer(locations, many=True)
        return Response(serializer.data)


class TaxiBookingViewSet(viewsets.ModelViewSet):
    serializer_class = TaxiBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Students see only their bookings; admins see all"""
        user = self.request.user
        if user.is_staff:
            return TaxiBooking.objects.all()
        return TaxiBooking.objects.filter(student=user)

    def create(self, request, *args, **kwargs):
        """Create a taxi booking request"""
        serializer = TaxiBookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get nearest taxi (optional - assign automatically)
        nearby_taxis = self._get_nearest_taxi(
            serializer.validated_data['pickup_lat'],
            serializer.validated_data['pickup_lng']
        )
        
        booking = TaxiBooking.objects.create(
            student=request.user,
            taxi=nearby_taxis[0] if nearby_taxis else None,
            **serializer.validated_data
        )
        
        response_serializer = TaxiBookingSerializer(booking)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def _get_nearest_taxi(self, lat, lng, radius=5):
        """Helper to get nearest available taxis"""
        taxis = Taxi.objects.filter(is_active=True).prefetch_related('locations')
        nearest = []
        
        for taxi in taxis:
            latest_location = taxi.locations.first()
            if latest_location and latest_location.is_available:
                distance = haversine_distance(
                    lat, lng,
                    latest_location.latitude, latest_location.longitude
                )
                if distance <= radius:
                    nearest.append((taxi, distance))
        
        # Sort by distance and return taxi objects
        nearest.sort(key=lambda x: x[1])
        return [taxi for taxi, _ in nearest]

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_booking(self, request, pk=None):
        """Admin/Taxi accepts a booking"""
        booking = self.get_object()
        if booking.status != 'requested':
            return Response(
                {'error': 'Booking cannot be accepted in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'accepted'
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_booking(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        if booking.student != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Not authorized to cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking.status = 'cancelled'
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
