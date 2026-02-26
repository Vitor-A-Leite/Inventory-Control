from rest_framework.viewsets import ModelViewSet

from .models import Batch
from .serializers import BatchSerializer


class BatchViewSet(ModelViewSet):
    queryset = Batch.objects.select_related("product").all().order_by("-created_at")
    serializer_class = BatchSerializer
