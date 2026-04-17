from rest_framework.routers import DefaultRouter
from .views import ExercicioViewSet, MusculoViewSet, EquipamentoViewSet

router = DefaultRouter()
router.register(r"exercicios", ExercicioViewSet, basename="exercicios")
router.register(r"musculos", MusculoViewSet, basename="musculos")
router.register(r"equipamentos", EquipamentoViewSet, basename="equipamentos")

urlpatterns = router.urls
