from django.db import models
from treinos.models import Treino
from exercicios.models import Exercicio

class TreinoExercicio(models.Model):
    treino = models.ForeignKey(Treino, on_delete=models.CASCADE, related_name="itens")
    exercicio = models.ForeignKey(Exercicio, on_delete=models.CASCADE)

    ordem = models.PositiveIntegerField(default=0)

    series = models.PositiveIntegerField()
    repeticoes = models.CharField(max_length=50)  # ex: "10-12"
    descanso = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.treino} - {self.exercicio}"