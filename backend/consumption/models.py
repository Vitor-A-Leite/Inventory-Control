from django.db import models
from core.models import BaseModel
from inventory.models import Batch
from users.models import User

class Consumption(BaseModel):
    batch = models.ForeignKey(Batch, on_delete=models.PROTECT)
    quantity_used = models.DecimalField(max_digits=10, decimal_places=3)
    used_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.batch.product.name} - {self.quantity_used}"
