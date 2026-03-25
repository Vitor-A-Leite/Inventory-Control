from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import Batch
from users.permissions import IsAdminOrManager
from .models import AlertConfig
from .serializers import AlertConfigSerializer, BatchAlertSerializer


def _batch_to_dict(batch, today):
    delta = (batch.expiration_date - today).days
    return {
        'id':             batch.id,
        'product_name':   batch.product.name,
        'category_name':  batch.product.category.name,
        'quantity':       batch.quantity,
        'unit_abbr':      batch.product.unit.abbreviation,
        'expiration_date': batch.expiration_date,
        'days_remaining': delta,
    }


class AlertListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        config = AlertConfig.get()
        today  = timezone.localdate()
        threshold_date = today + timedelta(days=config.days_before_expiration)

        qs = (
            Batch.objects
            .select_related('product__category', 'product__unit')
            .filter(quantity__gt=0)
        )

        expired = [
            _batch_to_dict(b, today)
            for b in qs.filter(expiration_date__lt=today).order_by('expiration_date')
        ]

        expiring_soon = [
            _batch_to_dict(b, today)
            for b in qs.filter(
                expiration_date__gte=today,
                expiration_date__lte=threshold_date,
            ).order_by('expiration_date')
        ]

        return Response({
            'config':        AlertConfigSerializer(config).data,
            'expired':       BatchAlertSerializer(expired, many=True).data,
            'expiring_soon': BatchAlertSerializer(expiring_soon, many=True).data,
        })


class AlertConfigView(APIView):
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        config = AlertConfig.get()
        return Response(AlertConfigSerializer(config).data)

    def patch(self, request):
        config = AlertConfig.get()
        serializer = AlertConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
