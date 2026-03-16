from django.contrib import admin

from products.models import Category, Product, Unit


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "abbreviation", "created_at")
    search_fields = ("name", "abbreviation")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "unit", "minimum_stock")
    list_filter = ("category", "unit", "created_at", "updated_at")
    search_fields = ("name", "category__name", "unit__name", "unit__abbreviation")
