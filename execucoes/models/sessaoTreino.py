from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class SessaoTreino(models.Model):
    class Status(models.TextChoices):
        INICIADA = "INICIADA", "Iniciada"
        CONCLUIDA = "CONCLUIDA", "Concluída"
        CANCELADA = "CANCELADA", "Cancelada"

    aluno = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessoes")
    treino = models.ForeignKey("treinos.Treino", on_delete=models.PROTECT, related_name="sessoes")

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INICIADA)

    iniciado_em = models.DateTimeField(auto_now_add=True)
    concluido_em = models.DateTimeField(null=True, blank=True)

    observacoes_gerais = models.TextField(blank=True)

    def __str__(self):
        return f"Sessão {self.id} - {self.aluno} - {self.treino}"