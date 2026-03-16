import uuid
from django.db import models
from core.models import BaseModel
from products.models import Product
from users.models import User

class Batch(BaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.FloatField()
    expiration_date = models.DateField()
    # Pensar em fazer o QR code ser gerado automaticamente
    qr_code = models.CharField(max_length=255, unique=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_batches",
    )

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"
