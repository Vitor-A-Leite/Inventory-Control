from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed

from .models import User


class ConsumerIdAuthentication(authentication.BaseAuthentication):
    """Authenticate requests using the X-User-Id header."""

    header_name = "HTTP_X_USER_ID"

    def authenticate(self, request):
        consumer_id = request.META.get(self.header_name)

        if not consumer_id:
            return None

        if not consumer_id.isdigit():
            raise AuthenticationFailed("X-User-Id inválido.")
        
        consumer_id = int(consumer_id)

        if consumer_id < 1 or consumer_id > 999:
            raise AuthenticationFailed("X-User-Id deve ser um número entre 1 e 999.")

        user = User.objects.filter(consumer_id=consumer_id).first()

        if user is None:
            raise AuthenticationFailed(
                "Usuário não encontrado para o X-User-Id de consumidor informado."
            )

        if not user.is_active:
            raise AuthenticationFailed("Usuário inativo.")

        return (user, None)
