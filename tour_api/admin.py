from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Scene, Hotspot


class HotspotInline(admin.StackedInline):
    """Inline admin untuk menambah hotspot (opsional - gunakan Visual Editor)"""
    model = Hotspot
    fk_name = 'from_scene'
    extra = 0
    fields = ('hotspot_type', 'to_scene', 'text', 'pitch', 'yaw')
    autocomplete_fields = ['to_scene']
    classes = ['collapse']
    
    verbose_name = "Hotspot Manual (Opsional)"
    verbose_name_plural = "Hotspot Manual - Lebih mudah gunakan Visual Editor di bawah"


@admin.register(Scene)
class SceneAdmin(admin.ModelAdmin):
    change_form_template = 'admin/tour_api/scene_change_form.html'
    list_display = (
        'thumbnail_preview',
        'title', 
        'building',
        'floor_badge',
        'location', 
        'published_date', 
        'is_featured_badge',
        'is_active_badge',
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
        ('Informasi Lokasi', {
            'fields': ('title', 'slug', 'description', 'location', 'published_date')
        }),
        ('Struktur Bangunan', {
            'fields': ('building', 'floor', 'order'),
            'description': 'Tentukan gedung dan lantai untuk organisasi yang lebih baik'
        }),
        ('Media', {
            'fields': ('panorama_image', 'thumbnail', 'panorama_preview')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
    )
    
    inlines = [HotspotInline]
    
    readonly_fields = ('created_at', 'updated_at', 'panorama_preview', 'hotspot_count')
    
    actions = ['make_featured', 'make_active', 'make_inactive']
    
    list_per_page = 20
    list_max_show_all = 100
    
    def thumbnail_preview(self, obj):
        """Show small thumbnail in list view"""
        if obj.thumbnail:
            return format_html(
                '<img src="{}" style="width: 80px; height: 45px; object-fit: cover; '
                'border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"/>',
                obj.thumbnail.url
            )
        return mark_safe('<div style="width: 80px; height: 45px; background: #ddd; '
                          'border-radius: 4px; display: flex; align-items: center; '
                          'justify-content: center; font-size: 10px; color: #999;">No Image</div>')
    thumbnail_preview.short_description = "Preview"
    
    def is_featured_badge(self, obj):
        """Visual badge for featured status"""
        if obj.is_featured:
            return mark_safe(
                '<span style="background: #f39c12; color: white; padding: 3px 8px; '
                'border-radius: 3px; font-size: 10px; font-weight: 600;">FEATURED</span>'
            )
        return mark_safe('<span style="color: #999;">-</span>')
    is_featured_badge.short_description = "Featured"
    
    def is_active_badge(self, obj):
        """Visual badge for active status"""
        if obj.is_active:
            return mark_safe(
                '<span style="background: #27ae60; color: white; padding: 3px 8px; '
                'border-radius: 3px; font-size: 10px; font-weight: 600;">ACTIVE</span>'
            )
        return mark_safe(
            '<span style="background: #e74c3c; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 10px; font-weight: 600;">INACTIVE</span>'
        )
    is_active_badge.short_description = "Status"
    
    def get_form(self, request, obj=None, **kwargs):
        """Pass all scenes to form for hotspot editor dropdown"""
        form = super().get_form(request, obj, **kwargs)
        return form
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        """Add extra context for visual editor"""
        extra_context = extra_context or {}
        extra_context['all_scenes'] = Scene.objects.filter(is_active=True).exclude(id=object_id)
        return super().change_view(request, object_id, form_url, extra_context=extra_context)
    
    def floor_badge(self, obj):
        """Visual badge for floor number"""
        if obj.floor:
            return format_html(
                '<span style="background: #0a5f38; color: white; padding: 4px 10px; '
                'border-radius: 4px; font-size: 11px; font-weight: 600;">Lt. {}</span>',
                obj.floor
            )
        return mark_safe(
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
        return mark_safe('<p style="color: #999;">Belum ada gambar</p>')
    panorama_preview.short_description = "Preview Panorama"
    
    def make_featured(self, request, queryset):
        """Set selected scene as featured (starting point)"""
        Scene.objects.filter(is_featured=True).update(is_featured=False)
        count = queryset.update(is_featured=True)
        self.message_user(request, f"{count} scene dijadikan featured (starting point)")
    make_featured.short_description = "Jadikan starting point"
    
    def make_active(self, request, queryset):
        """Activate selected scenes"""
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} scene diaktifkan")
    make_active.short_description = "Aktifkan scene"
    
    def make_inactive(self, request, queryset):
        """Deactivate selected scenes"""
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} scene dinonaktifkan")
    make_inactive.short_description = "Nonaktifkan scene"



@admin.register(Hotspot)
class HotspotAdmin(admin.ModelAdmin):
    change_form_template = 'admin/tour_api/hotspot/change_form.html'
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
