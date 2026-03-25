from django.urls import path

from .views import ConsumerIdValidationView, LoginView, LogoutView, UserListCreateView, UserDetailView


urlpatterns = [
    path(
        "validate-consumer-id/",
        ConsumerIdValidationView.as_view(),
        name="validate-consumer-id",
    ),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("", UserListCreateView.as_view(), name="user-list-create"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
]
