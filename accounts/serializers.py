from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[User.Role.ALUNO, User.Role.PROFESSOR])
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(min_length=1, max_length=150)
    last_name = serializers.CharField(min_length=1, max_length=150)
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este username já está em uso.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)

        # ✅ sempre nasce pendente e inativo (não loga até aprovar)
        user.status = User.Status.PENDING
        user.is_active = False

        user.save()
        return user
