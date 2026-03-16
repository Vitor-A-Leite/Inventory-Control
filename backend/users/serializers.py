from rest_framework import serializers

from .models import User


class ConsumerIdValidationInputSerializer(serializers.Serializer):
    consumer_id = serializers.IntegerField(min_value=1, max_value=999)


class ConsumerIdValidationResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "consumer_id", "role"]
