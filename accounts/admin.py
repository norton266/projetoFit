from django.contrib import admin

# Register your models here.
from .models import User, ProfessorProfile, AlunoProfile

admin.site.register(User)
admin.site.register(ProfessorProfile)
admin.site.register(AlunoProfile)