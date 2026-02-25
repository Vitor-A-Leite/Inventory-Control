from rest_framework import serializers
from .models import Consumption
from products.models import Product

class ProductBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "minimum_stock", "category", "unit"]


class ConsumptionSerializer(serializers.ModelSerializer):
    product_details = ProductBasicSerializer(source="batch.product", read_only=True)

    class Meta:
        model = Consumption
        fields = [
            "id",
            "batch",
            "product_details",
            "quantity_used",
            "used_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = ["id", "created_at", "updated_at","used_by"]

    def validate_quantity_used(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return value

    def validate(self, attrs):
        batch = attrs.get("batch") or getattr(self.instance, "batch", None)
        quantity_used = attrs.get("quantity_used")

        if batch and quantity_used is not None and quantity_used > batch.quantity:
            raise serializers.ValidationError({
                "quantity_used": "A quantidade utilizada não pode exceder a quantidade disponível no lote."
            })

        return attrs
