from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model

from treinos.models import Treino
from execucoes.models import SessaoTreino  # ajuste se o app/model tiver outro path

User = get_user_model()

class IsApprovedUser(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        # se não estiver autenticado, já bloqueia
        if not user or not user.is_authenticated:
            return False

        # se for aluno e NÃO estiver aprovado → bloqueia
        if user.role == "ALUNO" and user.status != "APPROVED":
           raise PermissionDenied("Seu cadastro ainda não foi aprovado pelo professor.")

        return True

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request):
        user = request.user
        role = getattr(user, "role", None)

        if role == "PROFESSOR":
            treinos = Treino.objects.filter(professor=user).count()

            # alunos que já foram aprovados
            alunos = User.objects.filter(
                role=User.Role.ALUNO,
                status=User.Status.APPROVED,
                aluno_profile__professor=user
            ).count()

            alunos_pendentes = User.objects.filter(
                role=User.Role.ALUNO,
                status=User.Status.PENDING,
                aluno_profile__professor=user
            ).count()

            sessoes = SessaoTreino.objects.filter(
                treino__professor=user
            ).count()

        else:  # ALUNO (ou qualquer outro)
            treinos = Treino.objects.filter(
                sessoes__aluno=user
            ).distinct().count()

            alunos = 0

            sessoes = SessaoTreino.objects.filter(
                aluno=user
            ).count()

        return Response({
            "treinos": treinos,
            "alunos": alunos,
            "sessoes": sessoes,
        })
