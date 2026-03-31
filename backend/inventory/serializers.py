from rest_framework import serializers
from django.utils import timezone
from .models import Batch
from products.models import Product


class ProductBasicSerializer(serializers.ModelSerializer):
    unit_abbreviation = serializers.CharField(source="unit.abbreviation", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "minimum_stock", "category", "unit", "unit_abbreviation"]


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
            "barcode",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "qr_code", "created_by", "created_at", "updated_at"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return value

    def validate_expiration_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("A data de validade não pode ser no passado.")
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
            "qr_code",
            "barcode",
            "is_expired",
            "can_consume",
        ]

    def get_is_expired(self, obj):
        return obj.expiration_date < timezone.localdate()

    def get_can_consume(self, obj):
        return obj.quantity > 0 and not self.get_is_expired(obj)
