from django.db import models
from django.conf import settings
from .sessaoTreino import SessaoTreino

User = settings.AUTH_USER_MODEL

class SessaoItem(models.Model):
    sessao = models.ForeignKey(SessaoTreino, on_delete=models.CASCADE, related_name="itens")
    treino_item = models.ForeignKey("treinos.TreinoItem", on_delete=models.PROTECT, related_name="sessoes_itens")

    # resultados reais
    carga_real = models.CharField(max_length=30, blank=True)       # ex: "42kg"
    repeticoes_reais = models.CharField(max_length=20, blank=True) # ex: "10,10,8" ou "12"
    rpe = models.PositiveIntegerField(null=True, blank=True)       # 1-10
    observacoes = models.TextField(blank=True)

    class Meta:
        unique_together = ("sessao", "treino_item")

    def __str__(self):
        return f"{self.sessao_id} - {self.treino_item_id}"