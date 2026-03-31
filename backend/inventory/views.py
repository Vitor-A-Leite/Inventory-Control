import uuid

from django.db.models import ProtectedError, Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from users.permissions import IsAdminOrManager
from .models import Batch
from .serializers import BatchQrEntrySerializer, BatchSerializer


class BatchViewSet(ModelViewSet):
    queryset = Batch.objects.select_related("product", "created_by").all().order_by("-created_at")
    serializer_class = BatchSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdminOrManager()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "Este lote possui consumos registrados e não pode ser excluído."},
                status=status.HTTP_409_CONFLICT,
            )

    def get_serializer_class(self):
        if self.action in {"qr_entry", "by_qr"}:
            return BatchQrEntrySerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            qr_code=str(uuid.uuid4()),
        )

    @action(detail=True, methods=["get"], url_path="qr-entry")
    def qr_entry(self, request, pk=None):
        batch = self.get_object()
        serializer = self.get_serializer(batch)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="by-qr")
    def by_qr(self, request):
        code = request.query_params.get("code", "").strip()
        if not code:
            return Response(
                {"detail": "O parâmetro 'code' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            batch = Batch.objects.select_related("product").get(
                Q(qr_code=code) | Q(barcode=code)
            )
        except Batch.DoesNotExist:
            return Response(
                {"detail": "Lote não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(batch)
        return Response(serializer.data)
