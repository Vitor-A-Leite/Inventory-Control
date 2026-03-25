from django.urls import path
from .views import AlertListView, AlertConfigView

urlpatterns = [
    path('', AlertListView.as_view(), name='alert-list'),
    path('config/', AlertConfigView.as_view(), name='alert-config'),
]
