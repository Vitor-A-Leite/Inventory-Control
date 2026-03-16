from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class ConsumerIdValidationViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester",
            password="123456",
            first_name="Teste",
            last_name="Usuario",
            consumer_id=101,
            role="EMPLOYEE",
        )

    def test_valid_consumer_id_returns_user_data(self):
        response = self.client.post(
            reverse("validate-consumer-id"),
            {"consumer_id": 101},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["username"], self.user.username)
        self.assertEqual(response.data["consumer_id"], self.user.consumer_id)
        self.assertEqual(response.data["role"], self.user.role)

    def test_unknown_consumer_id_returns_404(self):
        response = self.client.post(
            reverse("validate-consumer-id"),
            {"consumer_id": 999},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            response.data["detail"],
            "Usuário não encontrado para o consumer_id informado.",
        )

    def test_inactive_user_returns_403(self):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])

        response = self.client.post(
            reverse("validate-consumer-id"),
            {"consumer_id": self.user.consumer_id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["detail"], "Usuário inativo.")

    def test_invalid_consumer_id_returns_400(self):
        response = self.client.post(
            reverse("validate-consumer-id"),
            {"consumer_id": 1000},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("consumer_id", response.data)
