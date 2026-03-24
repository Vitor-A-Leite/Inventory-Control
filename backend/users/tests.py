from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

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


class LoginViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="loginuser",
            password="senha123",
            consumer_id=50,
            role="MANAGER",
        )
        self.employee = User.objects.create_user(
            username="funcionario",
            password="senha123",
            consumer_id=53,
            role="EMPLOYEE",
        )
        self.url = reverse("login")

    def test_login_com_credenciais_validas_retorna_tokens(self):
        response = self.client.post(
            self.url,
            {"username": "loginuser", "password": "senha123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "loginuser")

    def test_login_com_senha_errada_retorna_400(self):
        response = self.client.post(
            self.url,
            {"username": "loginuser", "password": "errada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_com_usuario_inexistente_retorna_400(self):
        response = self.client.post(
            self.url,
            {"username": "naoexiste", "password": "qualquer"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_usuario_inativo_retorna_400(self):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])

        response = self.client.post(
            self.url,
            {"username": "loginuser", "password": "senha123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_sem_campos_retorna_400(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_employee_nao_pode_fazer_login_com_senha(self):
        response = self.client.post(
            self.url,
            {"username": "funcionario", "password": "senha123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manager_pode_fazer_login_com_senha(self):
        User.objects.create_user(
            username="gerente", password="senha123", consumer_id=51, role="MANAGER"
        )
        response = self.client.post(
            self.url,
            {"username": "gerente", "password": "senha123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_admin_pode_fazer_login_com_senha(self):
        User.objects.create_user(
            username="chefe", password="senha123", consumer_id=52, role="ADMIN"
        )
        response = self.client.post(
            self.url,
            {"username": "chefe", "password": "senha123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


class LogoutViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="logoutuser",
            password="senha123",
            consumer_id=60,
            role="EMPLOYEE",
        )
        self.url = reverse("logout")
        self.refresh = RefreshToken.for_user(self.user)

    def _auth_header(self):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.refresh.access_token}"}

    def test_logout_com_token_valido_retorna_204(self):
        response = self.client.post(
            self.url,
            {"refresh": str(self.refresh)},
            format="json",
            **self._auth_header(),
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_sem_autenticacao_retorna_401(self):
        response = self.client.post(
            self.url,
            {"refresh": str(self.refresh)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_sem_refresh_token_retorna_400(self):
        response = self.client.post(
            self.url,
            {},
            format="json",
            **self._auth_header(),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_com_token_invalido_retorna_400(self):
        response = self.client.post(
            self.url,
            {"refresh": "tokeninvalido"},
            format="json",
            **self._auth_header(),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_duplo_retorna_400(self):
        """Usar o mesmo refresh token duas vezes deve falhar na segunda."""
        auth = self._auth_header()
        self.client.post(self.url, {"refresh": str(self.refresh)}, format="json", **auth)

        response = self.client.post(
            self.url,
            {"refresh": str(self.refresh)},
            format="json",
            **auth,
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class JWTPermissionsTests(APITestCase):
    """Testa que rotas protegidas exigem JWT válido."""

    def setUp(self):
        self.employee = User.objects.create_user(
            username="employee", password="senha123", consumer_id=70, role="EMPLOYEE"
        )
        self.manager = User.objects.create_user(
            username="manager", password="senha123", consumer_id=71, role="MANAGER"
        )
        self.admin = User.objects.create_user(
            username="admin_user", password="senha123", consumer_id=72, role="ADMIN"
        )

    def _auth(self, user):
        token = RefreshToken.for_user(user)
        return {"HTTP_AUTHORIZATION": f"Bearer {token.access_token}"}

    def test_rota_protegida_sem_token_retorna_401(self):
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_employee_pode_listar_produtos(self):
        response = self.client.get("/api/products/", **self._auth(self.employee))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_employee_nao_pode_criar_produto(self):
        data = {"name": "Produto Teste", "minimum_stock": 10}
        response = self.client.post(
            "/api/products/", data, format="json", **self._auth(self.employee)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_pode_criar_produto(self):
        from products.models import Category, Unit

        category = Category.objects.create(name="Cat Teste")
        unit = Unit.objects.create(name="kg", abbreviation="kg")

        data = {
            "name": "Produto Manager",
            "minimum_stock": 5,
            "category": category.id,
            "unit": unit.id,
        }
        response = self.client.post(
            "/api/products/", data, format="json", **self._auth(self.manager)
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_admin_pode_criar_produto(self):
        from products.models import Category, Unit

        category = Category.objects.create(name="Cat Admin")
        unit = Unit.objects.create(name="un", abbreviation="un")

        data = {
            "name": "Produto Admin",
            "minimum_stock": 2,
            "category": category.id,
            "unit": unit.id,
        }
        response = self.client.post(
            "/api/products/", data, format="json", **self._auth(self.admin)
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
