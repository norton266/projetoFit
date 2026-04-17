from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Equipamento(models.Model):
    nome = models.CharField(max_length=80, unique=True)

    def __str__(self):
        return self.nome