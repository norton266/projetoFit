from rest_framework import serializers
from ..models import Equipamento, Musculo, Exercicio
from .equipamento import EquipamentoSerializer
from .musculo import MusculoSerializer

class ExercicioSerializer(serializers.ModelSerializer):
    musculos_principais = MusculoSerializer(many=True, read_only=True)
    musculos_secundarios = MusculoSerializer(many=True, read_only=True)
    equipamento = EquipamentoSerializer(read_only=True)

    # para escrever (IDs)
    musculos_principais_ids = serializers.PrimaryKeyRelatedField(
        queryset=Musculo.objects.all(), many=True, write_only=True, required=False
    )
    musculos_secundarios_ids = serializers.PrimaryKeyRelatedField(
        queryset=Musculo.objects.all(), many=True, write_only=True, required=False
    )
    equipamento_id = serializers.PrimaryKeyRelatedField(
        queryset=Equipamento.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Exercicio
        fields = [
            "id", "nome", "descricao", "nivel",
            "video_url", "thumbnail_url",
            "musculos_principais", "musculos_secundarios", "equipamento",
            "musculos_principais_ids", "musculos_secundarios_ids", "equipamento_id",
            "criado_por", "criado_em",
        ]
        read_only_fields = ["criado_por", "criado_em"]

    def create(self, validated_data):
        principais = validated_data.pop("musculos_principais_ids", [])
        secundarios = validated_data.pop("musculos_secundarios_ids", [])
        equipamento = validated_data.pop("equipamento_id", None)

        exercicio = Exercicio.objects.create(**validated_data, equipamento=equipamento)
        if principais:
            exercicio.musculos_principais.set(principais)
        if secundarios:
            exercicio.musculos_secundarios.set(secundarios)
        return exercicio

    def update(self, instance, validated_data):
        principais = validated_data.pop("musculos_principais_ids", None)
        secundarios = validated_data.pop("musculos_secundarios_ids", None)
        equipamento = validated_data.pop("equipamento_id", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if equipamento is not None:
            instance.equipamento = equipamento

        instance.save()

        if principais is not None:
            instance.musculos_principais.set(principais)
        if secundarios is not None:
            instance.musculos_secundarios.set(secundarios)

        return instance