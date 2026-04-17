from django.db import models
from django.conf import settings
from .treino import Treino
from exercicios.models import Exercicio

class TreinoItem(models.Model):
    treino = models.ForeignKey(Treino, on_delete=models.CASCADE, related_name="itens")

    exercicio = models.ForeignKey(Exercicio, on_delete=models.PROTECT,
                                   related_name="itens_de_treino")
    ordem = models.PositiveIntegerField(default=0)

    series = models.PositiveIntegerField(default=3)
    repeticoes = models.CharField(max_length=20, default="8-12")  # ex: "8-12"
    carga = models.CharField(max_length=30, blank=True)          # ex: "20kg" / "peso corporal"
    descanso_seg = models.PositiveIntegerField(default=60)

    observacoes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.exercicio.nome} - {self.treino.titulo}"