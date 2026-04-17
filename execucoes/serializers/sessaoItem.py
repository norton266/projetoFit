from rest_framework import serializers
from django.utils import timezone
from ..models import SessaoItem

class SessaoItemSerializer(serializers.ModelSerializer):
    exercicio_nome = serializers.CharField(source="treino_item.exercicio.nome", read_only=True)

    class Meta:
        model = SessaoItem
        fields = [
            "id", "treino_item", "exercicio_nome",
            "carga_real", "repeticoes_reais", "rpe", "observacoes"
        ]
        read_only_fields = ["treino_item", "exercicio_nome"]