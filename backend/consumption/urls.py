from rest_framework.routers import DefaultRouter

from .views import ConsumptionViewSet

router = DefaultRouter()
router.register("consumptions", ConsumptionViewSet, basename="consumption")

urlpatterns = router.urls
