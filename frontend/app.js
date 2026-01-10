/**
 * Virtual Tour UNU Yogyakarta - Simple Version
 * Konsep: One scene per view, NO hotspot navigation, Simple info points
 */

// =================================================================
// CONFIGURATION
// =================================================================
const CONFIG = {
    // Check if API_BASE_URL is defined globally (e.g. from environment config)
    // Otherwise check if we are on localhost
    apiBaseUrl: window.API_BASE_URL ||
        (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000/api'
            : '/api'), // Relative path for production where front/back are on same domain
    endpoints: {
        scenes: '/scenes/',
        sceneDetail: (slug) => `/scenes/${slug}/`,
    }
};

// =================================================================
// STATE MANAGEMENT
// =================================================================
const state = {
    scenes: [],
    currentScene: null,
    viewer: null,
    loading: false
};

// =================================================================
// DOM ELEMENTS
// =================================================================
const DOM = {
    // Landing page
    landingPage: document.getElementById('landing-page'),
    galleryGrid: document.getElementById('gallery-grid'),

    // Viewer
    tourViewer: document.getElementById('tour-viewer'),
    panoramaViewer: document.getElementById('panorama-viewer'),
    viewerLoading: document.getElementById('viewer-loading'),

    // Info sidebar
    viewerTitle: document.getElementById('viewer-title'),
    viewerLocation: document.getElementById('viewer-location'),
    viewerDate: document.getElementById('viewer-date'),
    viewerDescription: document.getElementById('viewer-description'),

    // Buttons
    backToGalleryBtn: document.getElementById('back-to-gallery'),

    // Loading screen
    loadingScreen: document.getElementById('loading-screen')
};

// =================================================================
// API FUNCTIONS
// =================================================================

/**
 * Generic API fetch function
 */
async function fetchAPI(endpoint) {
    try {
        const url = `${CONFIG.apiBaseUrl}${endpoint}`;
        console.log('🌐 Fetching:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

/**
 * Load all scenes for gallery
 */
async function loadScenes() {
    try {
        showLoading(true);
        const data = await fetchAPI(CONFIG.endpoints.scenes);
        state.scenes = data;
        console.log('✅ Loaded scenes:', state.scenes.length);
        renderGallery();
    } catch (error) {
        console.error('Failed to load scenes:', error);
        alert('Gagal memuat data lokasi. Pastikan backend sudah berjalan.');
    } finally {
        showLoading(false);
    }
}

/**
 * Load single scene detail
 */
async function loadScene(slug) {
    try {
        showViewerLoading(true);
        const scene = await fetchAPI(CONFIG.endpoints.sceneDetail(slug));
        state.currentScene = scene;
        console.log('✅ Loaded scene:', scene.title);

        // Initialize viewer
        initializePanoramaViewer(scene);

        // Update info
        updateSceneInfo(scene);

    } catch (error) {
        console.error('Failed to load scene:', error);
        alert('Gagal memuat lokasi.');
    } finally {
        showViewerLoading(false);
    }
}

// =================================================================
// GALLERY RENDERING
// =================================================================

/**
 * Render gallery grid on landing page
 */
function renderGallery() {
    if (!DOM.galleryGrid) return;

    DOM.galleryGrid.innerHTML = state.scenes.map(scene => `
        <div class="gallery-item group cursor-pointer" onclick="openScene('${scene.slug}')">
            <div class="relative overflow-hidden rounded-2xl bg-gray-800">
                <!-- Thumbnail Image -->
                <img 
                    src="${scene.thumbnail || scene.panorama_image}" 
                    alt="${scene.title}"
                    class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                <!-- Content -->
                <div class="absolute bottom-0 left-0 right-0 p-6">
                    <h3 class="text-xl font-bold text-white mb-2">${scene.title}</h3>
                    <div class="flex items-center text-gray-300 text-sm mb-3">
                        <i class="fas fa-map-marker-alt text-[#f39c12] mr-2"></i>
                        <span>${scene.location || 'UNU Yogyakarta'}</span>
                    </div>
                    <p class="text-gray-400 text-sm line-clamp-2 mb-4">
                        ${scene.short_description || (scene.description ? scene.description.substring(0, 100) + '...' : 'Lokasi kampus UNU Yogyakarta')}
                    </p>
                    
                    <!-- View Button -->
                    <div class="flex items-center text-[#f39c12] font-semibold group-hover:text-[#0a5f38] transition-colors">
                        <span>Lihat Virtual Tour</span>
                        <i class="fas fa-arrow-right ml-2 transition-transform group-hover:translate-x-2"></i>
                    </div>
                </div>
                
                <!-- Featured Badge -->
                ${scene.is_featured ? `
                    <div class="absolute top-4 right-4 bg-[#f39c12] text-white px-3 py-1 rounded-full text-xs font-bold">
                        <i class="fas fa-star mr-1"></i> FEATURED
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// =================================================================
// PANORAMA VIEWER
// =================================================================

/**
 * Initialize Pannellum viewer with scene data
 */
function initializePanoramaViewer(scene) {
    // Destroy existing viewer if exists
    if (state.viewer) {
        state.viewer.destroy();
        state.viewer = null;
    }

    // Build hotspots for info points only (NO navigation)
    const hotspots = [];

    if (scene.hotspots && Array.isArray(scene.hotspots)) {
        scene.hotspots.forEach(hotspot => {
            // Only add info hotspots, skip link hotspots
            if (hotspot.type === 'info') {
                hotspots.push({
                    pitch: parseFloat(hotspot.pitch),
                    yaw: parseFloat(hotspot.yaw),
                    type: 'info',
                    text: hotspot.text,
                    cssClass: 'custom-info-hotspot'
                });
            }
        });
    }

    // Pannellum configuration
    const config = {
        type: 'equirectangular',
        panorama: scene.panorama_image,
        autoLoad: true,
        autoRotate: parseFloat(scene.auto_rotate_speed) || -2,
        autoRotateInactivityDelay: parseInt(scene.auto_rotate_delay) || 3000,

        // Camera settings
        pitch: parseFloat(scene.initial_pitch) || 0,
        yaw: parseFloat(scene.initial_yaw) || 0,
        hfov: parseFloat(scene.initial_hfov) || 100,

        // Limits
        minHfov: parseFloat(scene.min_hfov) || 50,
        maxHfov: parseFloat(scene.max_hfov) || 120,
        minPitch: parseFloat(scene.min_pitch) || -90,
        maxPitch: parseFloat(scene.max_pitch) || 90,

        // Hotspots (info only)
        hotSpots: hotspots,

        // UI settings
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        mouseZoom: true,
        draggable: true,
        keyboardZoom: true,

        // Compass
        compass: scene.show_compass || false,
        northOffset: parseFloat(scene.north_offset) || 0
    };

    console.log('🎬 Initializing Pannellum viewer...');
    state.viewer = pannellum.viewer(DOM.panoramaViewer, config);
}

/**
 * Update scene info in sidebar
 */
function updateSceneInfo(scene) {
    if (DOM.viewerTitle) DOM.viewerTitle.textContent = scene.title;
    if (DOM.viewerLocation) DOM.viewerLocation.textContent = scene.location || 'UNU Yogyakarta';
    if (DOM.viewerDate) {
        const date = new Date(scene.created_at);
        DOM.viewerDate.textContent = date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    if (DOM.viewerDescription) DOM.viewerDescription.textContent = scene.description;
}

// =================================================================
// UI FUNCTIONS
// =================================================================

/**
 * Open scene viewer
 */
function openScene(slug) {
    // Hide landing page
    if (DOM.landingPage) {
        DOM.landingPage.classList.add('hidden');
    }

    // Show viewer
    if (DOM.tourViewer) {
        DOM.tourViewer.classList.remove('hidden');
    }

    // Load scene
    loadScene(slug);
}

/**
 * Back to gallery
 */
function backToGallery() {
    // Destroy viewer
    if (state.viewer) {
        state.viewer.destroy();
        state.viewer = null;
    }

    // Hide viewer
    if (DOM.tourViewer) {
        DOM.tourViewer.classList.add('hidden');
    }

    // Show landing page
    if (DOM.landingPage) {
        DOM.landingPage.classList.remove('hidden');
    }

    state.currentScene = null;
}

/**
 * Show/hide main loading screen
 */
function showLoading(show) {
    if (DOM.loadingScreen) {
        if (show) {
            DOM.loadingScreen.classList.remove('hidden');
        } else {
            setTimeout(() => {
                DOM.loadingScreen.classList.add('hidden');
            }, 500);
        }
    }
}

/**
 * Show/hide viewer loading
 */
function showViewerLoading(show) {
    if (DOM.viewerLoading) {
        if (show) {
            DOM.viewerLoading.classList.remove('hidden');
        } else {
            setTimeout(() => {
                DOM.viewerLoading.classList.add('hidden');
            }, 800);
        }
    }
}

// =================================================================
// EVENT LISTENERS
// =================================================================

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Back to gallery button
    if (DOM.backToGalleryBtn) {
        DOM.backToGalleryBtn.addEventListener('click', backToGallery);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC - Back to gallery
        if (e.key === 'Escape' && state.currentScene) {
            backToGallery();
        }

        // F - Fullscreen
        if (e.key === 'f' || e.key === 'F') {
            if (state.viewer) {
                state.viewer.toggleFullscreen();
            }
        }
    });
}

// =================================================================
// INITIALIZATION
// =================================================================

/**
 * Initialize app
 */
async function initApp() {
    console.log('🚀 Initializing Virtual Tour App...');

    // Setup event listeners
    setupEventListeners();

    // Load scenes
    await loadScenes();

    console.log('✅ App initialized successfully!');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// =================================================================
// GLOBAL EXPORTS (for onclick handlers in HTML)
// =================================================================
window.openScene = openScene;
window.backToGallery = backToGallery;
window.closeTour = backToGallery; // Alias for HTML inline script
