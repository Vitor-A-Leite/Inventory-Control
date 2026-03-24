from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class ConsumerIdValidationInputSerializer(serializers.Serializer):
    consumer_id = serializers.IntegerField(min_value=1, max_value=999)


class ConsumerIdValidationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "consumer_id", "role"]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs["username"], password=attrs["password"])

        if user is None:
            raise serializers.ValidationError("Credenciais inválidas.")

        if not user.is_active:
            raise serializers.ValidationError("Usuário inativo.")

        if user.role not in ("ADMIN", "MANAGER"):
            raise serializers.ValidationError(
                "Apenas gerentes e administradores podem fazer login com senha."
            )

        attrs["user"] = user
        return attrs
