from rest_framework import serializers
from .models import Scene, Hotspot


class HotspotSerializer(serializers.ModelSerializer):
    """Serializer untuk Hotspot dengan informasi scene tujuan"""
    to_scene_slug = serializers.CharField(source='to_scene.slug', read_only=True, allow_null=True)
    to_scene_title = serializers.CharField(source='to_scene.title', read_only=True, allow_null=True)
    
    class Meta:
        model = Hotspot
        fields = [
            'id', 
            'hotspot_type', 
            'to_scene_slug',
            'to_scene_title',
            'text', 
            'info_description',
            'pitch', 
            'yaw'
        ]


class SceneListSerializer(serializers.ModelSerializer):
    """Serializer untuk list view - dipakai di galeri thumbnail"""
    
    class Meta:
        model = Scene
        fields = [
            'id', 
            'slug', 
            'title', 
            'thumbnail', 
            'location',
            'published_date',
            'is_featured'
        ]


class SceneDetailSerializer(serializers.ModelSerializer):
    """Serializer untuk detail view - data lengkap untuk viewer"""
    hotspots = HotspotSerializer(many=True, read_only=True)
    
    # URL fields (akan otomatis resolve ke full URL)
    panorama_image = serializers.ImageField(use_url=True)
    thumbnail = serializers.ImageField(use_url=True)
    
    class Meta:
        model = Scene
        fields = [
            'id', 
            'slug', 
            'title', 
            'description', 
            'location', 
            'published_date', 
            'author',
            'panorama_image', 
            'thumbnail', 
            'initial_pitch',
            'initial_yaw',
            'initial_fov',
            'is_featured',
            'hotspots',
            'created_at'
        ]


class PannellumConfigSerializer(serializers.Serializer):
    """Serializer khusus untuk menghasilkan config Pannellum.js"""
    
    def to_representation(self, scenes):
        """
        Converts Django Scene queryset to Pannellum multi-scene config
        
        Format output:
        {
            "default": {
                "firstScene": "gedung-rektorat",
                "sceneFadeDuration": 1000
            },
            "scenes": {
                "gedung-rektorat": {
                    "title": "Gedung Rektorat",
                    "panorama": "/media/panoramas/rektorat.jpg",
                    "hotSpots": [...]
                },
                ...
            }
        }
        """
        if not scenes:
            return {}
        
        # Get first scene (featured or first in list)
        first_scene = next((s for s in scenes if s.is_featured), scenes[0])
        
        config = {
            "default": {
                "firstScene": first_scene.slug,
                "sceneFadeDuration": 1000,
                "autoLoad": True,
                "showControls": True,
                "compass": True,
                "northOffset": 0
            },
            "scenes": {}
        }
        
        # Build scenes dictionary
        for scene in scenes:
            scene_config = {
                "title": scene.title,
                "author": scene.author,
                "panorama": scene.panorama_image.url if scene.panorama_image else "",
                "pitch": scene.initial_pitch,
                "yaw": scene.initial_yaw,
                "hfov": scene.initial_fov,
                "hotSpots": []
            }
            
            # Add hotspots
            for hotspot in scene.hotspots.all():
                hotspot_config = {
                    "pitch": hotspot.pitch,
                    "yaw": hotspot.yaw,
                    "type": "scene" if hotspot.hotspot_type == 'scene' else "info",
                    "text": hotspot.text,
                }
                
                if hotspot.hotspot_type == 'scene' and hotspot.to_scene:
                    hotspot_config["sceneId"] = hotspot.to_scene.slug
                elif hotspot.hotspot_type == 'info':
                    hotspot_config["text"] = hotspot.info_description or hotspot.text
                
                scene_config["hotSpots"].append(hotspot_config)
            
            config["scenes"][scene.slug] = scene_config
        
        return config
