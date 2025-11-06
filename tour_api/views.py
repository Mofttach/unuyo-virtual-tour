from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Scene, Hotspot
from .serializers import (
    SceneListSerializer, 
    SceneDetailSerializer,
    PannellumConfigSerializer
)


class SceneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API ViewSet untuk Virtual Tour Scenes
    
    Endpoints:
    - GET /api/scenes/          : List semua scene (untuk galeri)
    - GET /api/scenes/{slug}/   : Detail 1 scene
    - GET /api/scenes/featured/ : Get featured scene (scene pertama)
    - GET /api/scenes/pannellum/: Get full Pannellum config JSON
    """
    queryset = Scene.objects.filter(is_active=True)
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Use different serializer for list vs detail"""
        if self.action == 'list':
            return SceneListSerializer
        return SceneDetailSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Endpoint untuk mendapatkan featured scene (scene pertama kali dibuka)
        
        GET /api/scenes/featured/
        """
        scene = self.queryset.filter(is_featured=True).first()
        
        if not scene:
            # Fallback to first scene if no featured
            scene = self.queryset.first()
        
        if not scene:
            return Response(
                {"detail": "No active scenes found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SceneDetailSerializer(scene, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pannellum(self, request):
        """
        Endpoint untuk mendapatkan config lengkap dalam format Pannellum.js
        
        GET /api/scenes/pannellum/
        
        Returns:
        {
            "default": {"firstScene": "...", ...},
            "scenes": {
                "scene-slug": {
                    "title": "...",
                    "panorama": "...",
                    "hotSpots": [...]
                }
            }
        }
        """
        scenes = self.queryset.prefetch_related('hotspots', 'hotspots__to_scene')
        serializer = PannellumConfigSerializer(scenes)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to add helpful error messages"""
        try:
            return super().retrieve(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": f"Scene not found: {kwargs.get('slug')}"}, 
                status=status.HTTP_404_NOT_FOUND
            )
