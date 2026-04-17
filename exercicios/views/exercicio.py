from rest_framework import viewsets, permissions, filters
from ..models import Exercicio
from ..serializers import ExercicioSerializer
from ..permissions import IsProfessorOrAdmin

class ExercicioViewSet(viewsets.ModelViewSet):
    queryset = Exercicio.objects.all().order_by("nome")
    serializer_class = ExercicioSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome", "descricao"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsProfessorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(criado_por=self.request.user)

    def get_queryset(self):
        queryset = Exercicio.objects.all().order_by("nome")

        treino_id = self.request.query_params.get("treino")

        if treino_id:
            queryset = queryset.filter(treino_id=treino_id)

        return queryset