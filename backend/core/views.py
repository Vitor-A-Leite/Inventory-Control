from auditlog.models import LogEntry
from rest_framework import serializers
from rest_framework.generics import ListAPIView

from users.permissions import IsAdminOrManager

MODEL_LABELS = {
    'user': 'Usuário',
    'category': 'Categoria',
    'product': 'Produto',
    'unit': 'Unidade',
    'batch': 'Lote',
    'consumption': 'Consumo',
}

ACTION_LABELS = {
    LogEntry.Action.CREATE: 'Criação',
    LogEntry.Action.UPDATE: 'Edição',
    LogEntry.Action.DELETE: 'Exclusão',
}


class LogEntrySerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()
    model = serializers.SerializerMethodField()
    action_label = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry
        fields = ['id', 'timestamp', 'actor', 'model', 'object_repr',
                  'action', 'action_label', 'object_id', 'changes']

    def get_actor(self, obj):
        return obj.actor.username if obj.actor else 'Sistema'

    def get_model(self, obj):
        return MODEL_LABELS.get(obj.content_type.model, obj.content_type.model.title())

    def get_action_label(self, obj):
        return ACTION_LABELS.get(obj.action, str(obj.action))


class AuditLogView(ListAPIView):
    permission_classes = [IsAdminOrManager]
    serializer_class = LogEntrySerializer

    def get_queryset(self):
        qs = LogEntry.objects.select_related('content_type', 'actor').order_by('-timestamp')

        action = self.request.query_params.get('action')
        model = self.request.query_params.get('model')
        actor = self.request.query_params.get('actor')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if action is not None:
            qs = qs.filter(action=action)
        if model:
            qs = qs.filter(content_type__model=model)
        if actor:
            qs = qs.filter(actor__username__icontains=actor)
        if date_from:
            qs = qs.filter(timestamp__date__gte=date_from)
        if date_to:
            qs = qs.filter(timestamp__date__lte=date_to)

        return qs
