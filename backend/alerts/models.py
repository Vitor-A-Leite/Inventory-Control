from django.db import models
from core.models import BaseModel
from products.models import Product


class Alert(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Alert - {self.product.name}"


class AlertConfig(models.Model):
    """Singleton — armazena configuração global de alertas."""
    days_before_expiration = models.PositiveIntegerField(default=7)

    class Meta:
        verbose_name = 'Configuração de Alertas'

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"AlertConfig (notificar {self.days_before_expiration} dias antes)"
