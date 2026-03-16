from django.urls import path

from .views import ConsumerIdValidationView


urlpatterns = [
    path(
        "validate-consumer-id/",
        ConsumerIdValidationView.as_view(),
        name="validate-consumer-id",
    ),
]
