from django.db import models
from django.utils.text import slugify

class Scene(models.Model):
    """Model untuk setiap lokasi 360° di kampus UNU Yogyakarta"""
    
    # Basic Information
    title = models.CharField(
        max_length=200, 
        help_text="Nama lokasi, e.g., 'Gedung Rektorat UNU Yogyakarta'"
    )
    slug = models.SlugField(unique=True, max_length=250, blank=True)
    
    # Content
    description = models.TextField(
        help_text="Deskripsi lengkap dan menarik tentang lokasi ini"
    )
    
    # Location & Date
    location = models.CharField(
        max_length=100, 
        default="Yogyakarta",
        help_text="Kota/Kabupaten lokasi, e.g., 'Sleman, Yogyakarta'"
    )
    published_date = models.DateField(
        help_text="Tanggal publikasi virtual tour"
    )
    
    # Images
    panorama_image = models.ImageField(
        upload_to='panoramas/', 
        help_text="Foto 360° dalam format equirectangular (2:1 ratio)"
    )
    thumbnail = models.ImageField(
        upload_to='thumbnails/',
        help_text="Thumbnail untuk galeri (landscape 16:9 recommended)"
    )
    
    # Metadata
    author = models.CharField(
        max_length=100, 
        default="Tim Virtual Tour UNU",
        help_text="Nama pembuat/fotografer"
    )
    
    # Settings
    is_active = models.BooleanField(
        default=True,
        help_text="Tampilkan di virtual tour?"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Jadikan scene pertama yang muncul?"
    )
    
    # Pannellum Settings (Optional advanced settings)
    initial_pitch = models.FloatField(
        default=0,
        help_text="Sudut vertical awal kamera (-90 to 90)"
    )
    initial_yaw = models.FloatField(
        default=0,
        help_text="Sudut horizontal awal kamera (-180 to 180)"
    )
    initial_fov = models.FloatField(
        default=90,
        help_text="Field of view awal (50-120)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_featured', '-published_date', 'title']
        verbose_name = "Scene Virtual Tour"
        verbose_name_plural = "Scenes Virtual Tour"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Hotspot(models.Model):
    """Model untuk navigasi antar scene dan info point dalam panorama"""
    
    HOTSPOT_TYPE_CHOICES = [
        ('scene', 'Scene Link'),   # Navigasi ke scene lain
        ('info', 'Info Point'),    # Popup informasi statis
    ]
    
    # Relations
    from_scene = models.ForeignKey(
        Scene, 
        on_delete=models.CASCADE, 
        related_name='hotspots',
        help_text="Scene yang memiliki hotspot ini"
    )
    to_scene = models.ForeignKey(
        Scene, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='incoming_hotspots',
        help_text="Scene tujuan (wajib jika type=scene)"
    )
    
    # Type
    hotspot_type = models.CharField(
        max_length=10, 
        choices=HOTSPOT_TYPE_CHOICES,
        default='scene'
    )
    
    # Position in Panorama (Pannellum coordinates)
    pitch = models.FloatField(
        help_text="Sudut vertical (-90 to 90). 0=horizontal, -90=down, 90=up"
    )
    yaw = models.FloatField(
        help_text="Sudut horizontal (-180 to 180). 0=depan, -90=kiri, 90=kanan"
    )
    
    # Content
    text = models.CharField(
        max_length=100, 
        help_text="Label hotspot, e.g., 'Ke Perpustakaan' atau 'Info Masjid'"
    )
    info_description = models.TextField(
        blank=True,
        help_text="Deskripsi detail (hanya untuk type=info)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['from_scene', 'hotspot_type']
        verbose_name = "Hotspot"
        verbose_name_plural = "Hotspots"
    
    def __str__(self):
        if self.hotspot_type == 'scene' and self.to_scene:
            return f"{self.from_scene.title} → {self.to_scene.title}"
        return f"{self.from_scene.title} → {self.text}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.hotspot_type == 'scene' and not self.to_scene:
            raise ValidationError({
                'to_scene': 'Scene link hotspot harus memiliki tujuan scene'
            })
