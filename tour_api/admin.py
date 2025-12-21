from django.contrib import admin
from django.utils.html import format_html
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
        'building',
        'floor_badge',
        'location', 
        'published_date', 
        'is_featured',
        'is_active',
        'hotspot_count',
        'created_at'
    )
    list_filter = (
        'is_active',
        'is_featured',
        'building',
        'floor',
        'location',
        'published_date'
    )
    search_fields = ('title', 'description', 'author', 'building', 'floor_description')
    prepopulated_fields = {'slug': ('title',)}
    
    date_hierarchy = 'published_date'
    
    fieldsets = (
        ('Informasi Dasar', {
            'fields': ('title', 'slug', 'description')
        }),
        ('Struktur Kampus', {
            'fields': ('building', 'floor', 'floor_description', 'order'),
            'description': '<strong>Tentukan lokasi scene dalam struktur gedung dan lantai.</strong><br>'
                          'Floor: 1-9 untuk gedung bertingkat, kosongkan untuk area outdoor.<br>'
                          'Order: Urutan tampil dalam satu lantai (angka kecil = tampil lebih dulu).'
        }),
        ('Lokasi & Tanggal', {
            'fields': ('location', 'published_date', 'author')
        }),
        ('Media', {
            'fields': ('panorama_image', 'thumbnail', 'panorama_preview')
        }),
        ('Pengaturan Kamera 360°', {
            'classes': ('collapse',),
            'fields': ('initial_pitch', 'initial_yaw', 'initial_fov'),
            'description': 'Pitch: -90 (lantai) to 90 (langit). Yaw: -180 to 180 (0 = depan). FOV: 50-120 (zoom level).'
        }),
        ('Status Publikasi', {
            'fields': ('is_active', 'is_featured')
        }),
    )
    
    inlines = [HotspotInline]
    
    readonly_fields = ('created_at', 'updated_at', 'panorama_preview', 'hotspot_count')
    
    actions = ['make_featured', 'make_active', 'make_inactive', 'copy_to_next_floor']
    
    def floor_badge(self, obj):
        """Visual badge for floor number"""
        if obj.floor:
            return format_html(
                '<span style="background: #0a5f38; color: white; padding: 4px 10px; '
                'border-radius: 4px; font-size: 11px; font-weight: 600;">Lt. {}</span>',
                obj.floor
            )
        return format_html(
            '<span style="background: #666; color: white; padding: 4px 10px; '
            'border-radius: 4px; font-size: 11px; font-weight: 600;">Outdoor</span>'
        )
    floor_badge.short_description = "Lantai"
    
    def hotspot_count(self, obj):
        """Show hotspot count with color indicator"""
        count = obj.hotspots.count()
        color = '#0a5f38' if count > 0 else '#999'
        icon = '✓' if count > 0 else '⚠'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {} hotspot(s)</span>',
            color, icon, count
        )
    hotspot_count.short_description = "Hotspots"
    
    def panorama_preview(self, obj):
        """Show panorama preview in admin"""
        if obj.panorama_image:
            return format_html(
                '<div style="margin: 10px 0;">'
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width: 600px; width: 100%; height: auto; '
                'border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"/>'
                '</a>'
                '<p style="margin-top: 8px; color: #666; font-size: 12px;">'
                'Klik gambar untuk melihat ukuran penuh'
                '</p>'
                '</div>',
                obj.panorama_image.url,
                obj.thumbnail.url if obj.thumbnail else obj.panorama_image.url
            )
        return format_html('<p style="color: #999;">Belum ada gambar</p>')
    panorama_preview.short_description = "Preview Panorama"
    
    def make_featured(self, request, queryset):
        # Unfeature all scenes first
        Scene.objects.filter(is_featured=True).update(is_featured=False)
        # Feature selected scene (should be only one)
        count = queryset.update(is_featured=True)
        self.message_user(request, f"{count} scene dijadikan featured (starting point)")
    make_featured.short_description = "✨ Jadikan starting point"
    
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} scene diaktifkan")
    make_active.short_description = "✓ Aktifkan scene"
    
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} scene dinonaktifkan")
    make_inactive.short_description = "✗ Nonaktifkan scene"



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
