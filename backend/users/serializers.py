from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class UserListSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'role_display', 'consumer_id', 'is_active']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'password', 'role', 'consumer_id']

    def validate(self, attrs):
        role = attrs.get('role', 'EMPLOYEE')
        consumer_id = attrs.get('consumer_id')

        if role == 'EMPLOYEE' and not consumer_id:
            raise serializers.ValidationError({'consumer_id': 'Funcionários precisam de um consumer_id.'})

        if role != 'EMPLOYEE' and consumer_id:
            raise serializers.ValidationError({'consumer_id': 'Apenas funcionários usam consumer_id.'})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'role', 'consumer_id', 'is_active', 'password']

    def validate(self, attrs):
        role = attrs.get('role', self.instance.role if self.instance else 'EMPLOYEE')
        consumer_id = attrs.get('consumer_id', self.instance.consumer_id if self.instance else None)

        if role == 'EMPLOYEE' and not consumer_id:
            raise serializers.ValidationError({'consumer_id': 'Funcionários precisam de um consumer_id.'})

        if role != 'EMPLOYEE' and consumer_id:
            raise serializers.ValidationError({'consumer_id': 'Apenas funcionários usam consumer_id.'})

        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


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
