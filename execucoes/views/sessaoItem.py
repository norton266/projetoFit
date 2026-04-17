from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import SessaoTreino, SessaoItem
from ..serializers import (
    SessaoTreinoCreateSerializer,
    SessaoTreinoDetailSerializer,
    SessaoItemSerializer,
    SessaoFinalizarSerializer,
)
from ..permissions import IsAluno, IsOwnerAluno

class SessaoItemViewSet(viewsets.ModelViewSet):
    """
    Aluno atualiza os resultados (carga_real, reps, rpe, observações)
    """
    queryset = SessaoItem.objects.select_related("sessao", "treino_item", "treino_item__exercicio")
    serializer_class = SessaoItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsAluno, IsOwnerAluno]

    http_method_names = ["get", "patch", "put", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        return super().get_queryset().filter(sessao__aluno=user)