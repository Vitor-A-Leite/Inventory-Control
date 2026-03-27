from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import ConsumerIdValidationView, LoginView, LogoutView, UserListCreateView, UserDetailView


urlpatterns = [
    path(
        "validate-consumer-id/",
        ConsumerIdValidationView.as_view(),
        name="validate-consumer-id",
    ),
    path("login/", LoginView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("", UserListCreateView.as_view(), name="user-list-create"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
]
