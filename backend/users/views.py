from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import (
    ConsumerIdValidationInputSerializer,
    ConsumerIdValidationResponseSerializer,
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
