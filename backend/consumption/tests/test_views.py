from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from consumption.models import Consumption
from inventory.models import Batch
from products.models import Category, Product, Unit
from users.models import User


class ConsumptionViewSetTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Alimentos")
        self.unit = Unit.objects.create(name="Quilo", abbreviation="kg")
        self.product = Product.objects.create(
            name="Arroz", category=self.category, unit=self.unit, minimum_stock=1
        )
        self.batch = Batch.objects.create(
            product=self.product, quantity=10, expiration_date="2030-01-01", qr_code="QR-VIEW-1"
        )
        self.user = User.objects.create_user(
            username="tester", password="123456", consumer_id=101
        )

    def test_post_requires_authentication(self):
        response = self.client.post(
            reverse("consumption-list"),
            {"batch": str(self.batch.id), "quantity_used": 2},
            format="json",
        )
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_authenticated_post_creates_consumption_and_updates_stock(self):
        self.client.credentials(HTTP_X_USER_ID=str(self.user.consumer_id))
        response = self.client.post(
            reverse("consumption-list"),
            {"batch": str(self.batch.id), "quantity_used": 2},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.batch.refresh_from_db()
        self.assertEqual(self.batch.quantity, 8)
        self.assertEqual(Consumption.objects.count(), 1)
        self.assertEqual(Consumption.objects.first().used_by, self.user)

    def test_patch_is_not_allowed(self):
        self.client.credentials(HTTP_X_USER_ID=str(self.user.consumer_id))
        consumption = Consumption.objects.create(
            batch=self.batch, quantity_used=1, used_by=self.user
        )

        response = self.client.patch(
            reverse("consumption-detail", args=[consumption.id]),
            {"quantity_used": 5},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_is_not_allowed(self):
        self.client.credentials(HTTP_X_USER_ID=str(self.user.consumer_id))
        consumption = Consumption.objects.create(
            batch=self.batch, quantity_used=1, used_by=self.user
        )

        response = self.client.delete(reverse("consumption-detail", args=[consumption.id]))
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_invalid_user_id_header_returns_401(self):
        self.client.credentials(HTTP_X_USER_ID="999999")
        response = self.client.post(
            reverse("consumption-list"),
            {"batch": str(self.batch.id), "quantity_used": 2},
            format="json",
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
