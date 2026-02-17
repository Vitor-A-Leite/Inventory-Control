from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel

class User(AbstractUser):
    ROLE_CHOICES = (
        ("ADMIN", "Administrador"),
        ("MANAGER", "Gerente"),
        ("EMPLOYEE", "Funcionário"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="EMPLOYEE")

    def __str__(self):
        return self.username
