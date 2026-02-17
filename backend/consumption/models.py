from django.db import models
from core.models import BaseModel
from inventory.models import Batch
from users.models import User

class Consumption(BaseModel):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    quantity_used = models.FloatField()
    used_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.batch.product.name} - {self.quantity_used}"
