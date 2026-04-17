from django.contrib import admin


# Register your models here.
from .models.sessaoItem import SessaoItem
from .models.sessaoTreino import SessaoTreino

admin.site.register(SessaoItem)
admin.site.register(SessaoTreino)