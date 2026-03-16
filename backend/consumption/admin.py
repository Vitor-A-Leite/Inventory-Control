from django.contrib import admin

from consumption.models import Consumption


@admin.register(Consumption)
class ConsumptionAdmin(admin.ModelAdmin):
    list_display = ("id", "batch", "quantity_used", "used_by", "created_at")
    list_filter = ("created_at", "updated_at")
    search_fields = ("batch__product__name", "used_by__username")
