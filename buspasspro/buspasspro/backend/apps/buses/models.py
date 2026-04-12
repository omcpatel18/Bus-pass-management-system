from django.db import models
from django.db.models import Q

class Bus(models.Model):
    bus_number   = models.CharField(max_length=20, unique=True)
    route        = models.ForeignKey('passes.Route', on_delete=models.SET_NULL, null=True, related_name='buses')
    capacity     = models.IntegerField(default=50)
    driver_name  = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=15)
    is_active    = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(capacity__gt=0),
                name='ck_bus_capacity_positive',
            ),
        ]

    def __str__(self):
        return f'Bus {self.bus_number}'

class BusLocation(models.Model):
    bus       = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='locations')
    latitude  = models.FloatField()
    longitude = models.FloatField()
    speed_kmh = models.FloatField(default=0)
    stop_name = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        get_latest_by = 'timestamp'
        constraints = [
            models.CheckConstraint(condition=Q(latitude__gte=-90) & Q(latitude__lte=90),
                name='ck_buslocation_lat_range',
            ),
            models.CheckConstraint(condition=Q(longitude__gte=-180) & Q(longitude__lte=180),
                name='ck_buslocation_lng_range',
            ),
            models.CheckConstraint(condition=Q(speed_kmh__gte=0),
                name='ck_buslocation_speed_non_negative',
            ),
        ]

    def __str__(self):
        return f'{self.bus.bus_number} at {self.timestamp}'

class BusSchedule(models.Model):
    bus          = models.ForeignKey(Bus, on_delete=models.CASCADE)
    stop_name    = models.CharField(max_length=100)
    arrival_time = models.TimeField()
    stop_order   = models.IntegerField()
    is_active    = models.BooleanField(default=True)

    class Meta:
        ordering = ['stop_order']
        constraints = [
            models.CheckConstraint(condition=Q(stop_order__gte=0),
                name='ck_busschedule_stop_order_non_negative',
            ),
            models.UniqueConstraint(
                fields=['bus', 'stop_order'],
                name='uq_busschedule_bus_stop_order',
            ),
        ]

