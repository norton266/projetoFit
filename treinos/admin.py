from django.contrib import admin

# Register your models here.
from .models.treino import Treino
from .models.treinoItem import TreinoItem

admin.site.register(Treino)
admin.site.register(TreinoItem)