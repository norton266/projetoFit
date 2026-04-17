from rest_framework.permissions import BasePermission

class IsProfessorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        return bool(request.user and request.user.is_authenticated and role in ("PROFESSOR", "ADMIN"))
