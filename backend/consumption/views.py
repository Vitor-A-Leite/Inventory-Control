from rest_framework.viewsets import ModelViewSet

from .models import Consumption
from .serializers import ConsumptionSerializer


class ConsumptionViewSet(ModelViewSet):
    queryset = (
        Consumption.objects.select_related("batch__product", "used_by")
        .all()
        .order_by("-created_at")
    )
    serializer_class = ConsumptionSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(used_by=user)
