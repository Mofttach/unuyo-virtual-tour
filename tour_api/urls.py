from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SceneViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'scenes', SceneViewSet, basename='scene')

app_name = 'tour_api'

urlpatterns = [
    path('', include(router.urls)),
]

# Available endpoints:
# GET  /api/scenes/              -> List all scenes
# GET  /api/scenes/{slug}/       -> Detail of specific scene
# GET  /api/scenes/featured/     -> Get featured scene (first scene to load)
# GET  /api/scenes/pannellum/    -> Get full Pannellum config
