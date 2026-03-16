from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Batch
from .serializers import BatchQrEntrySerializer, BatchSerializer


class BatchViewSet(ModelViewSet):
    queryset = Batch.objects.select_related("product", "created_by").all().order_by("-created_at")
    serializer_class = BatchSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action in {"create", "qr_entry"}:
            return [IsAuthenticated()]
        return []

    def get_serializer_class(self):
        if self.action == "qr_entry":
            return BatchQrEntrySerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get"], url_path="qr-entry")
    def qr_entry(self, request, pk=None):
        batch = self.get_object()
        serializer = self.get_serializer(batch)
        return Response(serializer.data)
