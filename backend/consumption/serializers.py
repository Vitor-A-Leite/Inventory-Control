from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import Consumption
from inventory.models import Batch
from products.models import Product
from users.models import User

class ProductBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "minimum_stock", "category", "unit"]


class ConsumptionHistorySerializer(serializers.ModelSerializer):
    product_name     = serializers.CharField(source='batch.product.name', read_only=True)
    category_name    = serializers.CharField(source='batch.product.category.name', read_only=True)
    unit_abbr        = serializers.CharField(source='batch.product.unit.abbreviation', read_only=True)
    batch_expiration = serializers.DateField(source='batch.expiration_date', read_only=True)
    employee         = serializers.SerializerMethodField()

    class Meta:
        model = Consumption
        fields = [
            'id', 'created_at', 'product_name', 'category_name',
            'unit_abbr', 'quantity_used', 'batch_expiration', 'employee',
        ]

    def get_employee(self, obj):
        u = obj.used_by
        if not u:
            return '—'
        name = ' '.join(filter(None, [u.first_name, u.last_name]))
        return name or u.username


class ConsumptionSerializer(serializers.ModelSerializer):
    product_details = ProductBasicSerializer(source="batch.product", read_only=True)
    consumer_id = serializers.IntegerField(write_only=True, min_value=1, max_value=999)

    class Meta:
        model = Consumption
        fields = [
            "id",
            "batch",
            "product_details",
            "quantity_used",
            "consumer_id",
            "used_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = ["id", "created_at", "updated_at", "used_by"]

    def validate_consumer_id(self, value):
        user = User.objects.filter(consumer_id=value, is_active=True).first()
        if user is None:
            raise serializers.ValidationError("Nenhum funcionário encontrado com esse ID.")
        return value

    def validate_quantity_used(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return value

    def validate(self, attrs):
        batch = attrs.get("batch") or getattr(self.instance, "batch", None)
        quantity_used = attrs.get("quantity_used")

        if batch and batch.expiration_date < timezone.localdate():
            raise serializers.ValidationError({
                "batch": "Não é permitido registrar consumo de lote vencido."
            })

        if batch and quantity_used is not None and quantity_used > batch.quantity:
            raise serializers.ValidationError({
                "quantity_used": "A quantidade utilizada não pode exceder a quantidade disponível no lote."
            })

        return attrs

    def create(self, validated_data):
        batch = validated_data["batch"]
        quantity_used = validated_data["quantity_used"]
        consumer_id = validated_data.pop("consumer_id")
        employee = User.objects.filter(consumer_id=consumer_id, is_active=True).first()

        with transaction.atomic():
            locked_batch = Batch.objects.select_for_update().get(pk=batch.pk)

            if locked_batch.expiration_date < timezone.localdate():
                raise serializers.ValidationError({
                    "batch": "Não é permitido registrar consumo de lote vencido."
                })

            if quantity_used > locked_batch.quantity:
                raise serializers.ValidationError({
                    "quantity_used": "A quantidade utilizada não pode exceder a quantidade disponível no lote."
                })

            consumption = Consumption.objects.create(
                batch=locked_batch,
                quantity_used=quantity_used,
                used_by=employee,
            )

            locked_batch.quantity -= quantity_used
            locked_batch.save(update_fields=["quantity", "updated_at"])

        return consumption
