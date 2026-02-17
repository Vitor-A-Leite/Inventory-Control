from django.db import models
from core.models import BaseModel

class Category(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Unit(BaseModel):
    name = models.CharField(max_length=50)  # kg, g, unidade, litro
    abbreviation = models.CharField(max_length=10)

    def __str__(self):
        return self.abbreviation


class Product(BaseModel):
    name = models.CharField(max_length=150)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT)
    minimum_stock = models.FloatField(default=0)

    def __str__(self):
        return self.name
