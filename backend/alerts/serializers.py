from rest_framework import serializers
from .models import AlertConfig


class AlertConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertConfig
        fields = ['days_before_expiration']

    def validate_days_before_expiration(self, value):
        if value < 1:
            raise serializers.ValidationError('O valor mínimo é 1 dia.')
        if value > 365:
            raise serializers.ValidationError('O valor máximo é 365 dias.')
        return value


class BatchAlertSerializer(serializers.Serializer):
    id            = serializers.UUIDField()
    product_name  = serializers.CharField()
    category_name = serializers.CharField()
    quantity      = serializers.FloatField()
    unit_abbr     = serializers.CharField()
    expiration_date = serializers.DateField()
    days_remaining  = serializers.IntegerField()
