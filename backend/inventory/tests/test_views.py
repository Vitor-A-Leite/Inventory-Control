from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from inventory.models import Batch
from products.models import Category, Product, Unit
from users.models import User


class BatchViewSetTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Alimentos")
        self.unit = Unit.objects.create(name="Quilo", abbreviation="kg")
        self.product = Product.objects.create(
            name="Arroz", category=self.category, unit=self.unit, minimum_stock=1
        )
        self.user = User.objects.create_user(username="tester", password="123456")

    def test_post_requires_authentication(self):
        response = self.client.post(
            reverse("batch-list"),
            {
                "product": self.product.id,
                "quantity": 10,
                "expiration_date": "2030-01-01",
                "qr_code": "QR-BATCH-1",
            },
            format="json",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_authenticated_post_creates_batch_with_creator(self):
        self.client.credentials(HTTP_X_USER_ID=str(self.user.id))
        response = self.client.post(
            reverse("batch-list"),
            {
                "product": self.product.id,
                "quantity": 10,
                "expiration_date": "2030-01-01",
                "qr_code": "QR-BATCH-2",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Batch.objects.count(), 1)
        self.assertEqual(Batch.objects.first().created_by, self.user)

    def test_invalid_user_id_header_returns_401(self):
        self.client.credentials(HTTP_X_USER_ID="999999")
        response = self.client.post(
            reverse("batch-list"),
            {
                "product": self.product.id,
                "quantity": 10,
                "expiration_date": "2030-01-01",
                "qr_code": "QR-BATCH-3",
            },
            format="json",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
