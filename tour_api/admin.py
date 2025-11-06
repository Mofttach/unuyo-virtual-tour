from django.contrib import admin
from .models import Scene, Hotspot


class HotspotInline(admin.TabularInline):
    """Inline admin untuk menambah hotspot langsung dari halaman Scene"""
    model = Hotspot
    fk_name = 'from_scene'
    extra = 1
    fields = ('hotspot_type', 'to_scene', 'text', 'pitch', 'yaw', 'info_description')
    autocomplete_fields = ['to_scene']


@admin.register(Scene)
class SceneAdmin(admin.ModelAdmin):
    list_display = (
        'title', 
        'location', 
        'published_date', 
        'is_featured',
        'is_active', 
        'author',
        'created_at'
    )
    list_filter = ('is_active', 'is_featured', 'location', 'published_date')
    search_fields = ('title', 'description', 'author')
    prepopulated_fields = {'slug': ('title',)}
    
    date_hierarchy = 'published_date'
    
    fieldsets = (
        ('Informasi Dasar', {
            'fields': ('title', 'slug', 'description')
        }),
        ('Lokasi & Tanggal', {
            'fields': ('location', 'published_date', 'author')
        }),
        ('Media', {
            'fields': ('panorama_image', 'thumbnail')
        }),
        ('Pengaturan Kamera 360°', {
            'classes': ('collapse',),
            'fields': ('initial_pitch', 'initial_yaw', 'initial_fov'),
            'description': 'Pengaturan sudut kamera awal saat scene dibuka'
        }),
        ('Status Publikasi', {
            'fields': ('is_active', 'is_featured')
        }),
    )
    
    inlines = [HotspotInline]
    
    readonly_fields = ('created_at', 'updated_at')
    
    actions = ['make_featured', 'make_active', 'make_inactive']
    
    def make_featured(self, request, queryset):
        # Unfeature all scenes first
        Scene.objects.filter(is_featured=True).update(is_featured=False)
        # Feature selected scene
        queryset.update(is_featured=True)
        self.message_user(request, f"{queryset.count()} scene dijadikan featured")
    make_featured.short_description = "Jadikan scene featured (halaman utama)"
    
    def make_active(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} scene diaktifkan")
    make_active.short_description = "Aktifkan scene"
    
    def make_inactive(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} scene dinonaktifkan")
    make_inactive.short_description = "Nonaktifkan scene"


@admin.register(Hotspot)
class HotspotAdmin(admin.ModelAdmin):
    list_display = (
        'from_scene', 
        'hotspot_type', 
        'text', 
        'to_scene', 
        'pitch', 
        'yaw'
    )
    list_filter = ('hotspot_type', 'from_scene')
    search_fields = ('text', 'from_scene__title', 'to_scene__title')
    
    autocomplete_fields = ['from_scene', 'to_scene']
    
    fieldsets = (
        ('Relasi Scene', {
            'fields': ('from_scene', 'to_scene')
        }),
        ('Tipe & Konten', {
            'fields': ('hotspot_type', 'text', 'info_description')
        }),
        ('Posisi di Panorama', {
            'fields': ('pitch', 'yaw'),
            'description': 'Pitch: -90 (bawah) to 90 (atas). Yaw: -180 to 180 (0=depan)'
        }),
    )


# Customize Admin Site Header
admin.site.site_header = "Virtual Tour UNU Yogyakarta"
admin.site.site_title = "Admin Virtual Tour"
admin.site.index_title = "Kelola Virtual Tour Kampus"
