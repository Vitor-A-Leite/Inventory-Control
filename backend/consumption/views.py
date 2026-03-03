from rest_framework.permissions import IsAuthenticated
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
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def perform_create(self, serializer):
        serializer.save(used_by=self.request.user)
