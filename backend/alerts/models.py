from django.db import models
from core.models import BaseModel
from products.models import Product

class Alert(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Alert - {self.product.name}"
