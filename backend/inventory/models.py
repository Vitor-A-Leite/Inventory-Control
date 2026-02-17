import uuid
from django.db import models
from core.models import BaseModel
from products.models import Product

class Batch(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.FloatField()
    expiration_date = models.DateField()
    qr_code = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"
