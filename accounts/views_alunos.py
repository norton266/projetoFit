from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import User, AlunoProfile

class MyAlunosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, "role", None) != "PROFESSOR":
            return Response({"detail": "Apenas professor."}, status=403)

        alunos = (
            User.objects
            .filter(role=User.Role.ALUNO, aluno_profile__professor=request.user)
            .values("id", "username", "first_name", "last_name", "email")
            .order_by("first_name", "username")
        )

        return Response(list(alunos))
