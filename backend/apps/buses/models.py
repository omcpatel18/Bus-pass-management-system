from django.db import models

class Bus(models.Model):
    bus_number   = models.CharField(max_length=20, unique=True)
    route        = models.ForeignKey('passes.Route', on_delete=models.SET_NULL, null=True, related_name='buses')
    capacity     = models.IntegerField(default=50)
    driver_name  = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=15)
    is_active    = models.BooleanField(default=True)

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
