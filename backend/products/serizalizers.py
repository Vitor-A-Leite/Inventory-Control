from rest_framework import serializers
from .models import Category, Product, Unit


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name", "abbreviation", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "category", "unit", "minimum_stock", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_minimum_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("O estoque mínimo não pode ser negativo.")
        return value
