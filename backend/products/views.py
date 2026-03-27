from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from users.permissions import IsAdminOrManager

from .models import Category, Product, Unit
from .serializers import CategorySerializer, ProductSerializer, UnitSerializer

SAFE_METHODS = ("GET", "HEAD", "OPTIONS")


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all().order_by("-created_at")
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminOrManager()]


class UnitViewSet(ModelViewSet):
    queryset = Unit.objects.all().order_by("name")
    serializer_class = UnitSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminOrManager()]


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related("category", "unit").all().order_by("-created_at")
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminOrManager()]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "Este produto possui lotes vinculados e não pode ser excluído."},
                status=status.HTTP_409_CONFLICT,
            )
