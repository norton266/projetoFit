from rest_framework import viewsets, permissions, filters
from ..models import Equipamento
from ..serializers import EquipamentoSerializer
from ..permissions import IsProfessorOrAdmin

class EquipamentoViewSet(viewsets.ModelViewSet):
    queryset = Equipamento.objects.all().order_by("nome")
    serializer_class = EquipamentoSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsProfessorOrAdmin()]
        return [permissions.IsAuthenticated()]
