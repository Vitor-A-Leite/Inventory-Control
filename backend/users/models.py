from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from core.models import BaseModel

class User(AbstractUser):
    ROLE_CHOICES = (
        ("ADMIN", "Administrador"),
        ("MANAGER", "Gerente"),
        ("EMPLOYEE", "Funcionário"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="EMPLOYEE")
    consumer_id = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(999)], unique=True, blank=True, null=True)


    def __str__(self):
        return self.username
