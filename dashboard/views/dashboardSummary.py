from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from treinos.models import Treino
from execucoes.models import SessaoTreino  # ajuste se o app/model tiver outro path

User = get_user_model()

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, "role", None)

        if role == "PROFESSOR":
            treinos = Treino.objects.filter(professor=user).count()

            # alunos que já tiveram sessão em treinos desse professor (contagem distinta)
            alunos = User.objects.filter(
                sessoes__treino__professor=user
            ).distinct().count()

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
