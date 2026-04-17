from rest_framework import serializers
from ..models.treinoItem import TreinoItem
from exercicios.models import Exercicio
from exercicios.serializers import ExercicioSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class TreinoItemSerializer(serializers.ModelSerializer):
    exercicio = ExercicioSerializer(read_only=True)
    exercicio_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercicio.objects.all(), write_only=True, source="exercicio"
    )

    class Meta:
        model = TreinoItem
        fields = [
            "id", "exercicio", "exercicio_id", "ordem", "series", "repeticoes",
            "carga", "descanso_seg", "observacoes"
        ]

    