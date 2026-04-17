from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            "id": u.id,
            "username": u.username,
            "email": getattr(u, "email", ""),
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": getattr(u, "role", None),
            "status": getattr(u, "status", None),
        })

