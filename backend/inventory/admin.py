from django.contrib import admin

from inventory.models import Batch


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "quantity", "expiration_date", "created_by")
    list_filter = ("expiration_date", "created_at", "updated_at")
    search_fields = ("product__name", "qr_code", "created_by__username")
