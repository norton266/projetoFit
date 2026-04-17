from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import SessaoTreino, SessaoItem
from ..serializers import (
    SessaoTreinoCreateSerializer,
    SessaoTreinoDetailSerializer,
    SessaoItemSerializer,
    SessaoFinalizarSerializer,
)
from ..permissions import IsAluno, IsOwnerAluno

class SessaoTreinoViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Aluno: só vê suas sessões
        if getattr(user, "role", None) == "ALUNO":
            return SessaoTreino.objects.filter(aluno=user).order_by("-iniciado_em")

        # Professor: vê sessões dos alunos vinculados a ele
        if getattr(user, "role", None) == "PROFESSOR":
            # Assumindo que AlunoProfile.professor aponta pro professor (como fizemos antes)
            return SessaoTreino.objects.filter(aluno__aluno_profile__professor=user).order_by("-iniciado_em")

        # Admin
        if user.is_staff or user.is_superuser:
            return SessaoTreino.objects.all().order_by("-iniciado_em")

        return SessaoTreino.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return SessaoTreinoCreateSerializer
        if self.action == "finalizar":
            return SessaoFinalizarSerializer
        return SessaoTreinoDetailSerializer

    def get_permissions(self):
        # Criar/finalizar: aluno
        if self.action in ["create", "finalizar"]:
            return [permissions.IsAuthenticated(), IsAluno()]
        return [permissions.IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        sessao = self.get_object()
        # aluno só acessa a própria
        if getattr(request.user, "role", None) == "ALUNO" and sessao.aluno_id != request.user.id:
            return Response({"detail": "Não autorizado."}, status=status.HTTP_403_FORBIDDEN)
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=["patch"], url_path="finalizar")
    def finalizar(self, request, pk=None):
        sessao = self.get_object()

        if sessao.aluno_id != request.user.id:
            return Response({"detail": "Não autorizado."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(sessao, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(SessaoTreinoDetailSerializer(sessao).data)
