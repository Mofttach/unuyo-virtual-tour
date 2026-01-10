from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django.db.models import Count
from django.shortcuts import get_object_or_404
from .models import Scene, Hotspot
from .serializers import (
    SceneListSerializer, 
    SceneDetailSerializer,
    PannellumConfigSerializer,
    HotspotSerializer
)


class SceneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Enhanced API ViewSet untuk Virtual Tour Scenes dengan floor navigation
    
    Endpoints:
    - GET /api/scenes/               : List semua scene (untuk galeri)
    - GET /api/scenes/?floor=1       : Filter by floor number
    - GET /api/scenes/?building=...  : Filter by building name
    - GET /api/scenes/{slug}/        : Detail 1 scene
    - GET /api/scenes/featured/      : Get featured scene (starting point)
    - GET /api/scenes/floors/        : Get list of floors with scene count
    - GET /api/scenes/buildings/     : Get list of buildings with scene count
    - GET /api/scenes/pannellum/     : Get full Pannellum config JSON
    """
    queryset = Scene.objects.filter(is_active=True).select_related().prefetch_related('hotspots', 'hotspots__to_scene')
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Use different serializer for list vs detail"""
        if self.action == 'list':
            return SceneListSerializer
        return SceneDetailSerializer
    
    def get_queryset(self):
        """Enhanced queryset with floor and building filtering"""
        queryset = super().get_queryset()
        
        # Filter by floor
        floor = self.request.query_params.get('floor')
        if floor:
            queryset = queryset.filter(floor=floor)
        
        # Filter by building
        building = self.request.query_params.get('building')
        if building:
            queryset = queryset.filter(building=building)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Endpoint untuk mendapatkan featured scene (starting point)
        
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
    def floors(self, request):
        """
        Get all floors with scene count
        
        GET /api/scenes/floors/
        GET /api/scenes/floors/?building=Gedung Utama
        
        Response:
        [
            {"floor": 1, "floor_description": "Lobby & Ruang Kuliah", "scene_count": 5},
            {"floor": 2, "floor_description": "Laboratorium", "scene_count": 3}
        ]
        """
        building = request.query_params.get('building')
        
        queryset = Scene.objects.filter(is_active=True, floor__isnull=False)
        if building:
            queryset = queryset.filter(building=building)
        
        floors = queryset.values('floor', 'floor_description').annotate(
            scene_count=Count('id')
        ).order_by('floor')
        
        return Response(floors)
    
    @action(detail=False, methods=['get'])
    def buildings(self, request):
        """
        Get all buildings with scene count
        
        GET /api/scenes/buildings/
        
        Response:
        [
            {"building": "Gedung Utama", "scene_count": 20},
            {"building": "Gedung A", "scene_count": 10}
        ]
        """
        buildings = Scene.objects.filter(is_active=True).values('building').annotate(
            scene_count=Count('id')
        ).order_by('building')
        
        return Response(buildings)
    
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


class HotspotViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for Hotspot CRUD operations (for admin visual editor)
    
    Endpoints:
    - GET /api/hotspots/              : List all hotspots
    - GET /api/hotspots/{id}/         : Get hotspot detail
    - POST /api/hotspots/             : Create new hotspot
    - PUT /api/hotspots/{id}/         : Update hotspot
    - DELETE /api/hotspots/{id}/      : Delete hotspot
    """
    queryset = Hotspot.objects.all().select_related('from_scene', 'to_scene')
    serializer_class = HotspotSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter by from_scene if provided"""
        queryset = super().get_queryset()
        from_scene = self.request.query_params.get('from_scene')
        
        if from_scene:
            queryset = queryset.filter(from_scene_id=from_scene)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create hotspot with validation"""
        serializer.save()
    
    def perform_update(self, serializer):
        """Update hotspot with validation"""
        serializer.save()

