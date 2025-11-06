/**
 * Virtual Tour UNU Yogyakarta - Simple Version
 * Konsep: One scene per view, NO hotspot navigation, Simple info points
 */

// =================================================================
// CONFIGURATION
// =================================================================
const CONFIG = {
    apiBaseUrl: 'http://127.0.0.1:8000/api',
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
    
    // Loading screen
    loadingScreen: document.getElementById('loading-screen')
};

// =================================================================
// API FUNCTIONS
// =================================================================

/**
 * Generic fetch helper
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const url = `${CONFIG.apiBaseUrl}${endpoint}`;
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Fetch all scenes for gallery
 */
async function fetchAllScenes() {
    try {
        const data = await fetchAPI(CONFIG.endpoints.scenes);
        return data.results || data;
    } catch (error) {
        console.error('Error loading scenes:', error);
        showError('Gagal memuat data lokasi. Silakan refresh halaman.');
        return [];
    }
}

/**
 * Fetch single scene detail
 */
async function fetchSceneDetail(slug) {
    try {
        const data = await fetchAPI(CONFIG.endpoints.sceneDetail(slug));
        return data;
    } catch (error) {
        console.error('Error loading scene detail:', error);
        showError('Gagal memuat detail lokasi.');
        return null;
    }
}

// =================================================================
// GALLERY FUNCTIONS
// =================================================================

/**
 * Render gallery grid
 */
function renderGallery(scenes) {
    if (!scenes || scenes.length === 0) {
        DOM.galleryGrid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <i class="fas fa-images text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">Belum ada lokasi tersedia</p>
            </div>
        `;
        return;
    }
    
    DOM.galleryGrid.innerHTML = scenes.map(scene => `
        <div 
            class="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
            onclick="openScene('${scene.slug}')"
        >
            <div class="aspect-video relative overflow-hidden bg-gray-200">
                ${scene.thumbnail ? `
                    <img 
                        src="${scene.thumbnail}" 
                        alt="${scene.title}"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                    />
                ` : `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-unu-primary to-unu-dark">
                        <i class="fas fa-image text-white/50 text-4xl"></i>
                    </div>
                `}
                ${scene.is_featured ? `
                    <div class="absolute top-3 right-3 bg-unu-gold text-unu-dark px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <i class="fas fa-star"></i>
                        <span>Featured</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-unu-primary transition-colors">
                    ${scene.title}
                </h3>
                <div class="flex items-start gap-2 text-sm text-gray-500 mb-3">
                    <i class="fas fa-map-marker-alt text-red-500 mt-1"></i>
                    <span class="line-clamp-2">${scene.location || 'Kampus UNU Yogyakarta'}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-400">
                    <span>
                        <i class="far fa-calendar"></i>
                        ${formatDate(scene.created_at)}
                    </span>
                    <span class="text-unu-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Lihat 360°
                        <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// =================================================================
// VIEWER FUNCTIONS
// =================================================================

/**
 * Open scene viewer
 */
async function openScene(slug) {
    // Show viewer, hide landing
    DOM.landingPage.classList.add('hidden');
    DOM.tourViewer.classList.remove('hidden');
    DOM.viewerLoading.classList.remove('hidden');
    
    // Fetch scene detail
    const scene = await fetchSceneDetail(slug);
    
    if (!scene) {
        closeTour();
        return;
    }
    
    state.currentScene = scene;
    
    // Update sidebar info
    updateSidebarInfo(scene);
    
    // Initialize panorama viewer
    initializePanoramaViewer(scene);
}

/**
 * Update sidebar with scene info
 */
function updateSidebarInfo(scene) {
    DOM.viewerTitle.textContent = scene.title;
    DOM.viewerLocation.textContent = scene.location || 'Kampus UNU Yogyakarta';
    DOM.viewerDate.textContent = formatDate(scene.created_at);
    DOM.viewerDescription.textContent = scene.description || 'Tidak ada deskripsi tersedia.';
}

/**
 * Initialize Pannellum viewer (Simple, NO hotspots)
 */
function initializePanoramaViewer(scene) {
    // Destroy existing viewer if any
    if (state.viewer) {
        state.viewer.destroy();
    }
    
    // Simple Pannellum config - NO hotspots for navigation
    const config = {
        type: "equirectangular",
        panorama: scene.panorama_image,
        autoLoad: true,
        
        // Camera settings
        hfov: scene.initial_hfov || 100,
        pitch: scene.initial_pitch || 0,
        yaw: scene.initial_yaw || 0,
        
        // UI controls
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        
        // Auto rotation
        autoRotate: scene.auto_rotate ? -2 : 0,
        autoRotateInactivityDelay: 3000,
        
        // Quality
        minHfov: 50,
        maxHfov: 120,
        
        // Events
        onLoad: () => {
            console.log('Panorama loaded successfully');
            DOM.viewerLoading.classList.add('hidden');
            
            // Add info hotspots if available (for additional info, NOT navigation)
            if (scene.hotspots && scene.hotspots.length > 0) {
                addInfoHotspots(scene.hotspots);
            }
        },
        onError: (error) => {
            console.error('Panorama load error:', error);
            DOM.viewerLoading.innerHTML = `
                <div class="text-center text-white">
                    <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <p class="text-lg mb-2">Gagal memuat panorama</p>
                    <p class="text-sm text-gray-400">${error}</p>
                    <button 
                        onclick="closeTour()" 
                        class="mt-4 px-6 py-2 bg-white text-unu-dark rounded-lg hover:bg-gray-200 transition-all"
                    >
                        Kembali
                    </button>
                </div>
            `;
        }
    };
    
    // Create viewer
    state.viewer = pannellum.viewer('panorama-viewer', config);
    window.currentViewer = state.viewer; // For closeTour() function
}

/**
 * Add info hotspots (NOT for navigation, just for additional info)
 * Format hotspot: { pitch, yaw, type: 'info', text: 'Info text' }
 */
function addInfoHotspots(hotspots) {
    // Filter only info type hotspots (ignore old navigation hotspots)
    const infoHotspots = hotspots.filter(h => h.type === 'info' || !h.target_scene);
    
    infoHotspots.forEach(hotspot => {
        state.viewer.addHotSpot({
            type: 'info',
            pitch: hotspot.pitch,
            yaw: hotspot.yaw,
            text: hotspot.text || hotspot.title || 'Informasi',
            cssClass: 'custom-info-hotspot'
        });
    });
}

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

/**
 * Format date to Indonesian format
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    
    return date.toLocaleDateString('id-ID', options);
}

/**
 * Show error message
 */
function showError(message) {
    // Simple alert for now, could be enhanced with toast notifications
    alert(message);
}

/**
 * Show loading screen
 */
function showLoading() {
    DOM.loadingScreen.classList.remove('hidden');
}

/**
 * Hide loading screen
 */
function hideLoading() {
    DOM.loadingScreen.classList.add('hidden');
}

// =================================================================
// INITIALIZATION
// =================================================================

/**
 * Initialize app on page load
 */
async function initializeApp() {
    console.log('🚀 Initializing Virtual Tour App...');
    
    showLoading();
    
    try {
        // Fetch all scenes
        const scenes = await fetchAllScenes();
        state.scenes = scenes;
        
        // Render gallery
        renderGallery(scenes);
        
        console.log(`✅ Loaded ${scenes.length} scenes`);
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showError('Gagal memuat aplikasi. Silakan refresh halaman.');
    } finally {
        hideLoading();
    }
}

// =================================================================
// GLOBAL FUNCTIONS (called from HTML)
// =================================================================

window.openScene = openScene;
window.closeTour = () => {
    DOM.tourViewer.classList.add('hidden');
    DOM.landingPage.classList.remove('hidden');
    if (state.viewer) {
        state.viewer.destroy();
        state.viewer = null;
    }
};

// =================================================================
// START APP
// =================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
