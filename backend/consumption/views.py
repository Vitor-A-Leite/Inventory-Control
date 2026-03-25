from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import Consumption
from .serializers import ConsumptionSerializer, ConsumptionHistorySerializer


class ConsumptionViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return ConsumptionHistorySerializer
        return ConsumptionSerializer

    def get_queryset(self):
        qs = (
            Consumption.objects
            .select_related("batch__product__category", "batch__product__unit", "used_by")
            .order_by("-created_at")
        )

        params = self.request.query_params
        date_from = params.get('date_from')
        date_to   = params.get('date_to')
        product   = params.get('product')
        category  = params.get('category')

        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        if product:
            qs = qs.filter(batch__product__name__icontains=product)
        if category:
            qs = qs.filter(batch__product__category__id=category)

        return qs

    def perform_create(self, serializer):
        serializer.save()
