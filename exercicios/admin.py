from django.contrib import admin

# Register your models here.
from .models.musculo import Musculo
from .models.equipamento import Equipamento
from .models.exercicio import Exercicio

admin.site.register(Musculo)
admin.site.register(Equipamento)
admin.site.register(Exercicio)