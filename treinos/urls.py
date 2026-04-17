from rest_framework.routers import DefaultRouter
from .views.treino import TreinoViewSet

router = DefaultRouter()
router.register(r"treinos", TreinoViewSet, basename="treinos")

urlpatterns = router.urls
