from rest_framework import serializers
from django.utils import timezone
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
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return value


class BatchQrEntrySerializer(serializers.ModelSerializer):
    product_details = ProductBasicSerializer(source="product", read_only=True)
    is_expired = serializers.SerializerMethodField()
    can_consume = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            "id",
            "product_details",
            "quantity",
            "expiration_date",
            "is_expired",
            "can_consume",
        ]

    def get_is_expired(self, obj):
        return obj.expiration_date < timezone.localdate()

    def get_can_consume(self, obj):
        return obj.quantity > 0 and not self.get_is_expired(obj)
