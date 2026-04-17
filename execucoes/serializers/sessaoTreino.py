from rest_framework import serializers
from django.utils import timezone
from ..models import SessaoTreino, SessaoItem
from treinos.models import Treino, TreinoItem
from .sessaoItem import SessaoItemSerializer

class SessaoTreinoCreateSerializer(serializers.ModelSerializer):
    treino = serializers.PrimaryKeyRelatedField(queryset=Treino.objects.all())

    class Meta:
        model = SessaoTreino
        fields = ["id", "treino", "status", "iniciado_em"]
        read_only_fields = ["id", "status", "iniciado_em"]

    def create(self, validated_data):
        request = self.context["request"]
        aluno = request.user
        treino = validated_data["treino"]

        # cria sessão
        sessao = SessaoTreino.objects.create(aluno=aluno, treino=treino)

        # clona itens do treino para itens da sessão
        itens = TreinoItem.objects.filter(treino=treino).order_by("ordem", "id")
        SessaoItem.objects.bulk_create([
            SessaoItem(sessao=sessao, treino_item=item)
            for item in itens
        ])

        return sessao


class SessaoTreinoDetailSerializer(serializers.ModelSerializer):
    itens = SessaoItemSerializer(many=True, read_only=True)
    treino_titulo = serializers.CharField(source="treino.titulo", read_only=True)

    class Meta:
        model = SessaoTreino
        fields = [
            "id", "treino", "treino_titulo",
            "status", "iniciado_em", "concluido_em",
            "observacoes_gerais", "itens"
        ]


class SessaoFinalizarSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessaoTreino
        fields = ["observacoes_gerais"]

    def update(self, instance, validated_data):
        instance.status = SessaoTreino.Status.CONCLUIDA
        instance.concluido_em = timezone.now()
        instance.observacoes_gerais = validated_data.get("observacoes_gerais", instance.observacoes_gerais)
        instance.save()
        return instance