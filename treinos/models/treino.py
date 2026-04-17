from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Treino(models.Model):
    class Tipo(models.TextChoices):
        TEMPLATE = "TEMPLATE", "Template (genérico)"
        ALUNO = "ALUNO", "Específico do aluno"

    professor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="treinos_criados",
    )
    aluno = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="treinos_recebidos",
        null=True,
        blank=True,
    )
    tipo = models.CharField(max_length=20, choices=Tipo.choices)

    titulo = models.CharField(max_length=120)
    descricao = models.TextField(blank=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titulo} ({self.tipo})"