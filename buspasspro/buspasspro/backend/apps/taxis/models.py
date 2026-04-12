from django.db import models
from django.db.models import Q
from django.contrib.auth import get_user_model

User = get_user_model()


class Taxi(models.Model):
    VEHICLE_TYPES = [
        ('sedan', 'Sedan'),
        ('suv', 'SUV'),
        ('auto', 'Auto Rickshaw'),
    ]
    
    driver_name    = models.CharField(max_length=100)
    driver_phone   = models.CharField(max_length=15, unique=True)
    vehicle_type   = models.CharField(max_length=20, choices=VEHICLE_TYPES, default='sedan')
    vehicle_number = models.CharField(max_length=20, unique=True)
    rating         = models.FloatField(default=4.5)  # Out of 5
    total_trips    = models.IntegerField(default=0)
    is_active      = models.BooleanField(default=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-rating', '-total_trips']
        constraints = [
            models.CheckConstraint(check=Q(rating__gte=0, rating__lte=5),
                name='ck_taxi_rating_range',
            ),
            models.CheckConstraint(check=Q(total_trips__gte=0),
                name='ck_taxi_total_trips_non_negative',
            ),
        ]

    def __str__(self):
        return f"{self.driver_name} - {self.vehicle_number}"

    @property
    def availability_status(self):
        latest_location = self.locations.first()  # Most recent location
        if latest_location:
            return f"Last seen at {latest_location.stop_name}"
        return "No tracking data"


class TaxiLocation(models.Model):
    taxi       = models.ForeignKey(Taxi, on_delete=models.CASCADE, related_name='locations')
    latitude   = models.FloatField()
    longitude  = models.FloatField()
    speed_kmh  = models.FloatField(default=0)
    stop_name  = models.CharField(max_length=100, blank=True)
    is_available = models.BooleanField(default=True)
    timestamp  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        get_latest_by = 'timestamp'
        constraints = [
            models.CheckConstraint(check=Q(latitude__gte=-90) & Q(latitude__lte=90),
                name='ck_taxilocation_lat_range',
            ),
            models.CheckConstraint(check=Q(longitude__gte=-180) & Q(longitude__lte=180),
                name='ck_taxilocation_lng_range',
            ),
            models.CheckConstraint(check=Q(speed_kmh__gte=0),
                name='ck_taxilocation_speed_non_negative',
            ),
        ]

    def __str__(self):
        return f"{self.taxi.vehicle_number} at {self.timestamp}"


class TaxiBooking(models.Model):
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('accepted', 'Accepted'),
        ('arrived', 'Arrived'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    student      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='taxi_bookings')
    taxi         = models.ForeignKey(Taxi, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    pickup_lat   = models.FloatField()
    pickup_lng   = models.FloatField()
    dropoff_lat  = models.FloatField(null=True, blank=True)
    dropoff_lng  = models.FloatField(null=True, blank=True)
    pickup_name  = models.CharField(max_length=150)
    dropoff_name = models.CharField(max_length=150, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    fare_estimate = models.FloatField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(check=Q(pickup_lat__gte=-90) & Q(pickup_lat__lte=90),
                name='ck_taxibooking_pickup_lat_range',
            ),
            models.CheckConstraint(check=Q(pickup_lng__gte=-180) & Q(pickup_lng__lte=180),
                name='ck_taxibooking_pickup_lng_range',
            ),
            models.CheckConstraint(check=(Q(dropoff_lat__isnull=True) | (Q(dropoff_lat__gte=-90) & Q(dropoff_lat__lte=90))),
                name='ck_taxibooking_dropoff_lat_range',
            ),
            models.CheckConstraint(check=(Q(dropoff_lng__isnull=True) | (Q(dropoff_lng__gte=-180) & Q(dropoff_lng__lte=180))),
                name='ck_taxibooking_dropoff_lng_range',
            ),
            models.CheckConstraint(check=(Q(fare_estimate__isnull=True) | Q(fare_estimate__gte=0)),
                name='ck_taxibooking_fare_non_negative',
            ),
        ]

    def __str__(self):
        return f"Booking #{self.id} - {self.student} - {self.status}"

