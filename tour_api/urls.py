from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SceneViewSet, HotspotViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'scenes', SceneViewSet, basename='scene')
router.register(r'hotspots', HotspotViewSet, basename='hotspot')

app_name = 'tour_api'

urlpatterns = [
    path('', include(router.urls)),
]

# Available endpoints:
# Scenes:
# GET  /api/scenes/              -> List all scenes
# GET  /api/scenes/{slug}/       -> Detail of specific scene
# GET  /api/scenes/featured/     -> Get featured scene (first scene to load)
# GET  /api/scenes/floors/       -> Get all floors with scene count
# GET  /api/scenes/buildings/    -> Get all buildings with scene count
# GET  /api/scenes/pannellum/    -> Get full Pannellum config
#
# Hotspots (for admin):
# GET    /api/hotspots/          -> List all hotspots
# POST   /api/hotspots/          -> Create new hotspot
# GET    /api/hotspots/{id}/     -> Get hotspot detail
# PUT    /api/hotspots/{id}/     -> Update hotspot
# DELETE /api/hotspots/{id}/     -> Delete hotspot
