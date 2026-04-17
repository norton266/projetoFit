from rest_framework.permissions import BasePermission

class IsAluno(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "role", None) == "ALUNO")

class IsOwnerAluno(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj pode ser SessaoTreino ou SessaoItem (que tem sessao)
        user = request.user
        if hasattr(obj, "aluno"):
            return obj.aluno_id == user.id
        if hasattr(obj, "sessao"):
            return obj.sessao.aluno_id == user.id
        return False
