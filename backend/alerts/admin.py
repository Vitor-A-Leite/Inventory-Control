from django.contrib import admin

from alerts.models import Alert


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "is_resolved", "created_at")
    list_filter = ("is_resolved", "created_at", "updated_at")
    search_fields = ("product__name", "message")
