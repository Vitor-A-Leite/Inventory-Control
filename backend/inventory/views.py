from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Batch
from .serializers import BatchSerializer


class BatchViewSet(ModelViewSet):
    queryset = Batch.objects.select_related("product", "created_by").all().order_by("-created_at")
    serializer_class = BatchSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        return []

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
