from django.urls import path
from .views import OptimizeRouteView, PredictDemandView, WeeklyForecastView, AvailableStopsView
urlpatterns = [
    path('optimize-route/',          OptimizeRouteView.as_view(),  name='optimize_route'),
    path('demand/<int:route_id>/',   PredictDemandView.as_view(),  name='predict_demand'),
    path('forecast/<int:route_id>/', WeeklyForecastView.as_view(), name='weekly_forecast'),
    path('stops/',                   AvailableStopsView.as_view(), name='available_stops'),
]
