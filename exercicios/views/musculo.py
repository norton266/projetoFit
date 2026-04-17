from rest_framework import viewsets, permissions, filters
from ..models import Musculo
from ..serializers import MusculoSerializer
from ..permissions import IsProfessorOrAdmin

class MusculoViewSet(viewsets.ModelViewSet):
    queryset = Musculo.objects.all().order_by("nome")
    serializer_class = MusculoSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsProfessorOrAdmin()]
        return [permissions.IsAuthenticated()]