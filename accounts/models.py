from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        PROFESSOR = "PROFESSOR", "Professor"
        ALUNO = "ALUNO", "Aluno"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendente"
        APPROVED = "APPROVED", "Aprovado"
        REJECTED = "REJECTED", "Recusado"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ALUNO,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default= Status.PENDING,
    )

    # opcional: se quiser forçar email único
    email = models.EmailField(unique=True)

class ProfessorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="professor_profile")
    cref = models.CharField(max_length=30, blank=True)  # registro profissional (opcional)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"Professor: {self.user.username}"

class AlunoProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="aluno_profile")
    professor = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="alunos",
        limit_choices_to={"role": User.Role.PROFESSOR},
    )
    data_nascimento = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Aluno: {self.user.username}"
