from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from .serializers import RegisterSerializer
from .permissions import IsProfessorOrAdmin
from .models import AlunoProfile, User

UserModel = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()

        return Response(
            {
                "ok": True,
                "message": "Cadastro enviado! Aguarde aprovação para acessar.",
                "user_id": user.id,
                "status": user.status,
            },
            status=status.HTTP_201_CREATED,
        )


class PendingUsersView(APIView):
    permission_classes = [IsAuthenticated, IsProfessorOrAdmin]

    def get(self, request):
        # Professor vê apenas pendentes (normalmente alunos)
        # Admin vê todos pendentes
        qs = UserModel.objects.filter(status=User.Status.PENDING).order_by("-date_joined")

        if request.user.role == User.Role.PROFESSOR:
            # professor só aprova ALUNO (pode ajustar se quiser)
            qs = qs.filter(role=User.Role.ALUNO)

        data = qs.values(
            "id", "username", "email", "first_name", "last_name", "role", "status", "date_joined"
        )
        return Response(list(data))


class ReviewUserView(APIView):
    permission_classes = [IsAuthenticated, IsProfessorOrAdmin]

    def post(self, request, user_id: int):
        action = request.data.get("action")
        if action not in ("approve", "reject"):
            return Response(
                {"detail": "Ação inválida. Use 'approve' ou 'reject'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # professor não pode revisar a si mesmo
        if request.user.id == user_id:
            return Response(
                {"detail": "Você não pode revisar o próprio usuário."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            u = User.objects.select_related("aluno_profile").get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if u.status != User.Status.PENDING:
            return Response({"detail": "Este usuário não está pendente."}, status=status.HTTP_400_BAD_REQUEST)

        # Professor só pode aprovar/recusar ALUNO
        if request.user.role == User.Role.PROFESSOR and u.role != User.Role.ALUNO:
            return Response(
                {"detail": "Professor só pode aprovar/recusar alunos."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Se for professor: se o aluno já tiver professor definido, só o mesmo professor pode revisar
        if request.user.role == User.Role.PROFESSOR and u.role == User.Role.ALUNO:
            prof_atual_id = getattr(getattr(u, "aluno_profile", None), "professor_id", None)
            if prof_atual_id and prof_atual_id != request.user.id:
                return Response(
                    {"detail": "Este aluno já está vinculado a outro professor."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        with transaction.atomic():
            if action == "approve":
                u.status = User.Status.APPROVED
                u.is_active = True
                u.save(update_fields=["status", "is_active"])

                # ✅ ao aprovar ALUNO por PROFESSOR, vincula o aluno ao professor
                professor_id = None
                if u.role == User.Role.ALUNO and request.user.role == User.Role.PROFESSOR:
                    profile, _ = AlunoProfile.objects.get_or_create(user=u)
                    profile.professor = request.user
                    profile.save(update_fields=["professor"])
                    professor_id = profile.professor_id

                return Response(
                    {
                        "ok": True,
                        "user_id": u.id,
                        "status": u.status,
                        "is_active": u.is_active,
                        "professor_id": professor_id,
                    },
                    status=status.HTTP_200_OK,
                )

            # action == "reject"
            u.status = User.Status.REJECTED
            u.is_active = False
            u.save(update_fields=["status", "is_active"])

            return Response(
                {"ok": True, "user_id": u.id, "status": u.status, "is_active": u.is_active},
                status=status.HTTP_200_OK,
            )