from django.contrib.admin import AdminSite
from django.db.models import Count


class VirtualTourAdminSite(AdminSite):
    """Custom Admin Site with dashboard stats"""
    site_header = "Virtual Tour UNU Yogyakarta"
    site_title = "Admin Virtual Tour"
    index_title = "Kelola Virtual Tour Kampus"

    def index(self, request, extra_context=None):
        """Add stats to admin index page"""
        from tour_api.models import Scene, Hotspot
        
        extra_context = extra_context or {}
        extra_context['stats'] = {
            'total_scenes': Scene.objects.count(),
            'active_scenes': Scene.objects.filter(is_active=True).count(),
            'total_hotspots': Hotspot.objects.count(),
            'buildings': Scene.objects.values('building').distinct().count(),
        }
        return super().index(request, extra_context=extra_context)


# Create instance
admin_site = VirtualTourAdminSite(name='admin')
