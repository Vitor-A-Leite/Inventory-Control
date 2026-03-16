from django.urls import reverse
from django.utils import timezone
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
        self.user = User.objects.create_user(
            username="tester", password="123456", consumer_id=101
        )

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
        self.client.credentials(HTTP_X_USER_ID=str(self.user.consumer_id))
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

    def test_qr_entry_returns_batch_data_for_scan_flow(self):
        batch = Batch.objects.create(
            product=self.product,
            quantity=10,
            expiration_date="2030-01-01",
            qr_code="QR-BATCH-ENTRY-1",
        )

        self.client.credentials(HTTP_X_USER_ID=str(self.user.consumer_id))
        response = self.client.get(reverse("batch-qr-entry", args=[batch.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(batch.id))
        self.assertEqual(response.data["quantity"], batch.quantity)
        self.assertEqual(response.data["product_details"]["id"], self.product.id)
        self.assertEqual(response.data["product_details"]["name"], self.product.name)
        self.assertFalse(response.data["is_expired"])
        self.assertTrue(response.data["can_consume"])

    def test_qr_entry_marks_expired_batch_as_not_consumable(self):
        batch = Batch.objects.create(
            product=self.product,
            quantity=10,
            expiration_date=timezone.localdate() - timezone.timedelta(days=1),
            qr_code="QR-BATCH-ENTRY-2",
        )

        self.client.credentials(HTTP_X_USER_ID=str(self.user.consumer_id))
        response = self.client.get(reverse("batch-qr-entry", args=[batch.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_expired"])
        self.assertFalse(response.data["can_consume"])

    def test_qr_entry_marks_empty_batch_as_not_consumable(self):
        batch = Batch.objects.create(
            product=self.product,
            quantity=0,
            expiration_date="2030-01-01",
            qr_code="QR-BATCH-ENTRY-3",
        )

        self.client.credentials(HTTP_X_USER_ID=str(self.user.consumer_id))
        response = self.client.get(reverse("batch-qr-entry", args=[batch.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_expired"])
        self.assertFalse(response.data["can_consume"])

    def test_qr_entry_requires_authenticated_consumer(self):
        batch = Batch.objects.create(
            product=self.product,
            quantity=10,
            expiration_date="2030-01-01",
            qr_code="QR-BATCH-ENTRY-4",
        )

        response = self.client.get(reverse("batch-qr-entry", args=[batch.id]))

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
