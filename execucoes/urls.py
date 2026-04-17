from rest_framework.routers import DefaultRouter
from .views import SessaoTreinoViewSet, SessaoItemViewSet

router = DefaultRouter()
router.register(r"sessoes", SessaoTreinoViewSet, basename="sessoes")
router.register(r"sessao-itens", SessaoItemViewSet, basename="sessao-itens")

urlpatterns = router.urls