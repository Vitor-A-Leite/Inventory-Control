from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .serializers import (
    ConsumerIdValidationInputSerializer,
    ConsumerIdValidationResponseSerializer,
    LoginSerializer,
)


class ConsumerIdValidationView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        input_serializer = ConsumerIdValidationInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        consumer_id = input_serializer.validated_data["consumer_id"]
        user = User.objects.filter(consumer_id=consumer_id).first()

        if user is None:
            return Response(
                {"detail": "Usuário não encontrado para o consumer_id informado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.is_active:
            return Response(
                {"detail": "Usuário inativo."},
                status=status.HTTP_403_FORBIDDEN,
            )

        response_serializer = ConsumerIdValidationResponseSerializer(user)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": ConsumerIdValidationResponseSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "O campo 'refresh' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Token inválido ou já expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)
