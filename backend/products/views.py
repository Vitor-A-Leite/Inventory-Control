from rest_framework.viewsets import ModelViewSet
from .models import Category, Product, Unit
from .serizalizers import CategorySerializer, ProductSerializer, UnitSerializer


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all().order_by("-created_at")
    serializer_class = CategorySerializer


class UnitViewSet(ModelViewSet):
    queryset = Unit.objects.all().order_by("name")
    serializer_class = UnitSerializer

class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related("category", "unit").all().order_by("-created_at")
    serializer_class = ProductSerializer
