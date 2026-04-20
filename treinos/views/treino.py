from rest_framework import viewsets, permissions, status
from django.db import transaction
from rest_framework.response import Response
from rest_framework.decorators import action
from treinos.models import Treino, TreinoItem
from treinos.serializers.treino import TreinoSerializer  # ajuste seu import
from treinos.permissions import IsProfessor
from django.contrib.auth import get_user_model
from execucoes.models import SessaoTreino
from rest_framework.decorators import api_view



User = get_user_model()

class TreinoViewSet(viewsets.ModelViewSet):
    serializer_class = TreinoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsProfessor()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "role", None) == "PROFESSOR":
            return Treino.objects.filter(professor=user).order_by("-criado_em")
        if getattr(user, "role", None) == "ALUNO":
            return Treino.objects.filter(aluno=user).order_by("-criado_em")
        if user.is_staff or user.is_superuser:
            return Treino.objects.all().order_by("-criado_em")
        return Treino.objects.none()

        if getattr(user, "role", None) == "PROFESSOR":
            qs = Treino.objects.filter(professor=user).order_by("-criado_em")
            tipo = self.request.query_params.get("tipo")
            if tipo:
                qs = qs.filter(tipo=tipo)
            return qs

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=["post"], url_path="atribuir", permission_classes=[IsProfessor])
    def atribuir(self, request, pk=None):
        treino_base = self.get_object()

        if treino_base.professor_id != request.user.id:
            return Response({"detail": "Você não pode atribuir treinos de outro professor."}, status=403)

        if treino_base.tipo != Treino.Tipo.TEMPLATE:
            return Response({"detail": "Somente treinos TEMPLATE podem ser atribuídos."}, status=400)

        aluno_id = request.data.get("aluno")
        if not aluno_id:
            return Response({"aluno": "Informe o id do aluno."}, status=400)

        aluno = User.objects.filter(id=aluno_id).first()
        if not aluno or getattr(aluno, "role", None) != "ALUNO":
            return Response({"aluno": "Usuário inválido ou não é ALUNO."}, status=400)

        # agora sim pode validar vínculo do aluno com professor (se existir)
        prof_id = getattr(getattr(aluno, "aluno_profile", None), "professor_id", None)
        if prof_id != request.user.id:
            return Response({"detail": "Este aluno não pertence a você."}, status=403)

        with transaction.atomic():
            novo = Treino.objects.create(
                professor=request.user,
                aluno=aluno,
                tipo=Treino.Tipo.ALUNO,
                titulo=treino_base.titulo,
                descricao=treino_base.descricao,
            )

            itens = treino_base.itens.all().order_by("ordem", "id")
            TreinoItem.objects.bulk_create([
                TreinoItem(
                    treino=novo,
                    exercicio=item.exercicio,
                    ordem=item.ordem,
                    series=item.series,
                    repeticoes=item.repeticoes,
                    carga=item.carga,
                    descanso_seg=item.descanso_seg,
                    observacoes=item.observacoes,
                )
                for item in itens
            ])

        serializer = self.get_serializer(novo)
        return Response(serializer.data, status=201)
    
    @action(
        detail=False,
        methods=["get"],
        url_path=r"aluno/(?P<aluno_id>\d+)",
        permission_classes=[permissions.IsAuthenticated, IsProfessor],
    )
    def por_aluno(self, request, aluno_id=None):
        # valida aluno
        aluno = User.objects.filter(id=aluno_id, role=User.Role.ALUNO).first()
        if not aluno:
            return Response({"detail": "Aluno inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # garante que aluno pertence ao professor
        prof_id = getattr(getattr(aluno, "aluno_profile", None), "professor_id", None)
        if prof_id != request.user.id:
            return Response({"detail": "Este aluno não pertence a você."}, status=status.HTTP_403_FORBIDDEN)

        qs = Treino.objects.filter(
            professor=request.user,
            aluno=aluno,
            tipo=Treino.Tipo.ALUNO,
        ).order_by("-criado_em")

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"], url_path="exercicios")
    def exercicios(self, request, pk=None):
        treino = self.get_object()

        itens = TreinoItem.objects.filter(treino=treino).select_related("exercicio").order_by("ordem")

        data = [
            {
                "id": item.id,
                "nome": item.exercicio.nome,
                "series": item.series,
                "repeticoes": item.repeticoes,
                "carga": item.carga,
                "descanso": item.descanso_seg,
                "observacoes": item.observacoes,
            }
            for item in itens
        ]

        return Response(data)
    
    @action(detail=True, methods=["post"], url_path="iniciar")
    def iniciar(self, request, pk=None):
        treino = self.get_object()
        user = request.user

        # segurança: garantir que o treino é do aluno
        if getattr(user, "role", None) == "ALUNO":
            if treino.aluno_id != user.id:
                return Response(
                    {"detail": "Você não pode iniciar esse treino."},
                    status=403
                )

        sessao = SessaoTreino.objects.create(
            aluno=user,
            treino=treino
        )

        return Response({
            "sessao_id": sessao.id,
            "status": sessao.status
        }, status=201)
    
    @action(
    detail=False,
    methods=["get"],
    url_path=r"sessao/(?P<sessao_id>\d+)"
)
    def detalhe_sessao(self, request, sessao_id=None):
        sessao = SessaoTreino.objects.select_related("treino").get(id=sessao_id)

        itens = sessao.treino.itens.select_related("exercicio").all().order_by("ordem")

        return Response({
            "id": sessao.id,
            "treino": {
                "id": sessao.treino.id,
                "titulo": sessao.treino.titulo,
            },
            "exercicios": [
                {
                    "id": item.id,
                    "nome": item.exercicio.nome,
                    "series": item.series,
                    "repeticoes": item.repeticoes,
                }
                for item in itens
            ]
        })
    
    @action(
        detail=False,
        methods=["post"],
        url_path=r"sessao/(?P<sessao_id>\d+)/finalizar"
    )
    def finalizar_sessao(self, request, sessao_id=None):
        sessao = SessaoTreino.objects.get(id=sessao_id)

        # segurança básica
        if sessao.aluno != request.user:
            return Response({"detail": "Acesso negado"}, status=403)

        sessao.status = SessaoTreino.Status.CONCLUIDA
        sessao.save()

        return Response({"status": "ok"})
        
    