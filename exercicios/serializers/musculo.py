from rest_framework import serializers
from ..models import Musculo

class MusculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Musculo
        fields = ["id", "nome"]