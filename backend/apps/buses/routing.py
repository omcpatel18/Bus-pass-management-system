"""Buses App - WebSocket URL Routing"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/buses/track/(?P<route_id>\w+)/$', consumers.BusTrackingConsumer.as_asgi()),
    re_path(r'ws/buses/track/$', consumers.BusTrackingConsumer.as_asgi()),
]
