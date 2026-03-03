from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import CategoryViewSet, ProductViewSet, UnitViewSet

router = DefaultRouter()
router.register("", ProductViewSet, basename="product")  # gera /api/products/

category_list = CategoryViewSet.as_view({"get": "list", "post": "create"})
category_detail = CategoryViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)
unit_list = UnitViewSet.as_view({"get": "list", "post": "create"})
unit_detail = UnitViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("categories/", category_list, name="category-list"),
    path("categories/<int:pk>/", category_detail, name="category-detail"),
    path("units/", unit_list, name="unit-list"),
    path("units/<int:pk>/", unit_detail, name="unit-detail"),
]
urlpatterns += router.urls
