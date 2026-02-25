from rest_framework import serializers
from .models import Batch
from products.models import Product


class ProductBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "minimum_stock", "category", "unit"]


class BatchSerializer(serializers.ModelSerializer):
    product_details = ProductBasicSerializer(source="product", read_only=True)

    class Meta:
        model = Batch
        fields = [
            "id",
            "product",
            "product_details",
            "quantity",
            "expiration_date",
            "qr_code",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return value
