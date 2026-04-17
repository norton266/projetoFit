from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ProfessorProfile, AlunoProfile

@receiver(post_save, sender=User)
def create_profile(sender, instance: User, created, **kwargs):
    if not created:
        return

    if instance.role == User.Role.PROFESSOR:
        ProfessorProfile.objects.create(user=instance)
    elif instance.role == User.Role.ALUNO:
        AlunoProfile.objects.create(user=instance)
