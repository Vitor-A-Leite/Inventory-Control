from django.urls import path

from .views import ConsumerIdValidationView, LoginView, LogoutView


urlpatterns = [
    path(
        "validate-consumer-id/",
        ConsumerIdValidationView.as_view(),
        name="validate-consumer-id",
    ),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
