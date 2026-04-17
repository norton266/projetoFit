from rest_framework import serializers
from ..models.treinoItem import TreinoItem
from ..models.treino import Treino
from .treinoItem import TreinoItemSerializer
from django.contrib.auth import get_user_model

class TreinoSerializer(serializers.ModelSerializer):
    itens = TreinoItemSerializer(many=True)

    class Meta:
        model = Treino
        fields = [
            "id", "tipo", "titulo", "descricao", "professor", "aluno",
            "criado_em", "atualizado_em", "itens"
        ]
        read_only_fields = ["professor", "criado_em", "atualizado_em"]

    def validate(self, attrs):
        tipo = attrs.get("tipo")
        aluno = attrs.get("aluno")

        if tipo == Treino.Tipo.ALUNO and not aluno:
            raise serializers.ValidationError({"aluno": "Para treino específico, aluno é obrigatório."})

        if tipo == Treino.Tipo.TEMPLATE and aluno:
            raise serializers.ValidationError({"aluno": "Treino template não deve ter aluno."})

        # garante que aluno realmente seja ALUNO
        if aluno and getattr(aluno, "role", None) != "ALUNO":
            raise serializers.ValidationError({"aluno": "O usuário informado não é um aluno."})

        return attrs

    def create(self, validated_data):
        itens_data = validated_data.pop("itens", [])
        treino = Treino.objects.create(**validated_data)
        for item in itens_data:
            TreinoItem.objects.create(treino=treino, **item)
        return treino

    def update(self, instance, validated_data):
        itens_data = validated_data.pop("itens", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # atualização simples: apaga e recria itens (MVP)
        if itens_data is not None:
            instance.itens.all().delete()
            for item in itens_data:
                TreinoItem.objects.create(treino=instance, **item)

        return instance