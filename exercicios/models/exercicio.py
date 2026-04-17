from django.db import models
from django.conf import settings
from .musculo import Musculo
from .equipamento import Equipamento

User = settings.AUTH_USER_MODEL

class Exercicio(models.Model):
    class Nivel(models.TextChoices):
        INICIANTE = "INICIANTE", "Iniciante"
        INTERMEDIARIO = "INTERMEDIARIO", "Intermediário"
        AVANCADO = "AVANCADO", "Avançado"

    nome = models.CharField(max_length=120, unique=True)
    descricao = models.TextField(blank=True)

    musculos_principais = models.ManyToManyField(Musculo, related_name="exercicios_principais", blank=True)
    musculos_secundarios = models.ManyToManyField(Musculo, related_name="exercicios_secundarios", blank=True)

    equipamento = models.ForeignKey(Equipamento, null=True, blank=True, on_delete=models.SET_NULL, related_name="exercicios")

    nivel = models.CharField(max_length=20, choices=Nivel.choices, default=Nivel.INICIANTE)

    # futuramente: vídeo/thumbnail
    video_url = models.URLField(blank=True)
    thumbnail_url = models.URLField(blank=True)

    criado_por = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="exercicios_criados")
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome