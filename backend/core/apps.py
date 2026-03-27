from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        from auditlog.registry import auditlog
        from users.models import User
        from products.models import Category, Product, Unit
        from inventory.models import Batch
        from consumption.models import Consumption

        auditlog.register(User, exclude_fields=['last_login', 'password'])
        auditlog.register(Category)
        auditlog.register(Product)
        auditlog.register(Unit)
        auditlog.register(Batch, exclude_fields=['qr_code'])
        auditlog.register(Consumption)
