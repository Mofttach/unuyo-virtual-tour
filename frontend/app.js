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

// Expose state globally for inline scripts
window.state = state;

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
        
        // Update UI
    updateLocationBadge(scene.title);
    updateSceneInfo(scene);
    populateSceneMenu(); // Refresh menu active state
    populateThumbnailNav(); // Refresh thumbnail active statene title badge
        updateLocationBadge(scene);
        
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
 * @param {Object} scene - Scene data from API
 * @ param {Boolean} withIntro - Enable intro animation (zoom from sky)
 */
function initializePanoramaViewer(scene, withIntro = false) {
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

    // DEBUG: Dummy hotspot removed
    
    // Set initial camera position
    const initialPitch = withIntro ? 90 : parseFloat(scene.initial_pitch) || 0;  // Start from sky if intro
    const initialYaw = parseFloat(scene.initial_yaw) || 0;
    const initialHfov = withIntro ? 180 : parseFloat(scene.initial_hfov) || 100; // Wide FOV for little planet effect
    
    // Pannellum configuration
    const config = {
        type: 'equirectangular',
        panorama: scene.panorama_image,
        autoLoad: true,
        autoRotate: withIntro ? false : parseFloat(scene.auto_rotate_speed) || -2, // Disable during intro
        autoRotateInactivityDelay: parseInt(scene.auto_rotate_delay) || 3000,
        
        // Camera settings
        pitch: initialPitch,
        yaw: initialYaw,
        hfov: initialHfov,
        
        // Limits
        minHfov: parseFloat(scene.min_hfov) || 50,
        maxHfov: withIntro ? 180 : parseFloat(scene.max_hfov) || 120, // Allow extreme FOV for intro
        minPitch: parseFloat(scene.min_pitch) || -90,
        maxPitch: parseFloat(scene.max_pitch) || 90,
        
        // Hotspots (info only)
        hotSpots: hotspots,
        
        // UI settings - USE CUSTOM CONTROLS (disable Pannellum defaults)
        showControls: false, // Hide default controls, use custom buttons
        showFullscreenCtrl: false,
        showZoomCtrl: false,
        mouseZoom: true, // Keep mouse zoom enabled
        draggable: !withIntro, // Disable drag during intro
        keyboardZoom: true,
        
        // Compass
        compass: scene.show_compass || false,
        northOffset: parseFloat(scene.north_offset) || 0
    };
    
    console.log('🎬 Initializing Pannellum viewer...');
    state.viewer = pannellum.viewer(DOM.panoramaViewer, config);
    
    // Start intro animation if requested
    if (withIntro && window.IntroAnimation) {
        // Wait for viewer to fully load
        state.viewer.on('load', () => {
            console.log('🎭 Starting intro animation...');
            
            // Create intro animation instance
            const introAnim = window.createIntroAnimation(state.viewer, {
                duration: 3500,          // 3.5 seconds
                startFOV: 180,           // Little planet
                endFOV: 100,             // Normal view
                startPitch: 90,          // Sky
                endPitch: 0,             // Horizontal
                easing: 'easeInOutCubic',
                delay: 300,
                onComplete: () => {
                    // Re-enable controls and interactions
                    state.viewer.setUpdate(true);
                    
                    // Start auto-rotate after intro
                    if (parseFloat(scene.auto_rotate_speed) || -2) {
                        setTimeout(() => {
                            state.viewer.startAutoRotate(parseFloat(scene.auto_rotate_speed) || -2);
                        }, 1000);
                    }
                    // Populate UI
                    populateSceneMenu();
                    populateThumbnailNav();
                }
            });
            
            // Store animation instance
            state.currentIntroAnimation = introAnim;
        });
    }
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
 * Toggle info panel visibility
 */
function toggleInfoPanel() {
    const infoSidebar = document.getElementById('info-sidebar');
    const toggleBtn = document.getElementById('toggle-info-btn');
    
    if (infoSidebar) {
        const isHidden = infoSidebar.classList.contains('hidden');
        
        if (isHidden) {
            // Show panel
            infoSidebar.classList.remove('hidden');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="fas fa-times text-lg"></i><span class="text-sm">Tutup</span>';
            }
        } else {
            // Hide panel
            infoSidebar.classList.add('hidden');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="fas fa-info-circle text-lg"></i><span class="text-sm">Info</span>';
            }
        }
    }
}

/**
 * Open featured scene directly (for "Explore Campus" button)
 * With optional intro animation
 */
async function openFeaturedScene(withIntro = true) {
    try {
        // Show loading screen
        showLoading(true);
        
        // Fetch featured scene
        const scene = await fetchAPI('/scenes/featured/');
        
        if (!scene) {
            console.error('No featured scene found');
            alert('Belum ada scene yang ditandai sebagai starting point');
            return;
        }
        
        // Hide landing page
        if (DOM.landingPage) {
            DOM.landingPage.classList.add('hidden');
        }
        
        // Show viewer
        if (DOM.tourViewer) {
            DOM.tourViewer.classList.remove('hidden');
        }
        
        // Hide main loading screen
        showLoading(false);
        
        // Load scene
        state.currentScene = scene;
        console.log('✅ Opening featured scene:', scene.title);
        
        // Initialize viewer
        showViewerLoading(true);
        initializePanoramaViewer(scene, withIntro);
        
        // Update UI
        updateSceneInfo(scene);
        updateLocationBadge(scene);
        populateSceneMenu();
        populateThumbnailNav();
        
        showViewerLoading(false);
        
    } catch (error) {
        console.error('Failed to load featured scene:', error);
        alert('Gagal memuat scene pembuka. Periksa koneksi backend.');
        showLoading(false);
    }
}

/**
 * Open scene viewer
 */
function openScene(slug, withIntro = false) {
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
window.toggleInfoPanel = toggleInfoPanel;
window.openFeaturedScene = openFeaturedScene; // NEW - For "Explore Campus" button

// =================================================================
// THUMBNAIL NAVIGATION (BINUS-style) 
// =================================================================

/**
 * Load thumbnails into navigation bar
 */
async function loadThumbnailNav() {
    const container = document.getElementById('thumbnail-container');
    if (!container || !state.scenes || state.scenes.length === 0) {
        return;
    }
    
    // Create thumbnail elements
    container.innerHTML = state.scenes.map(scene => `
        <div class="scene-thumbnail ${scene.slug === state.currentScene?.slug ? 'active' : ''}" 
             data-slug="${scene.slug}"
             onclick="switchScene('${scene.slug}')">
            <img src="${scene.thumbnail || scene.panorama_image}" 
                 alt="${scene.title}"
                 loading="lazy">
            <div class="thumbnail-title">${scene.title}</div>
        </div>
    `).join('');
    
    // Scroll to active thumbnail
    setTimeout(() => scrollToActiveThumbnail(), 300);
}

/**
 * Switch to different scene from thumbnail
 */
function switchScene(slug) {
    if (!slug || slug === state.currentScene?.slug) return;
    
    console.log(`🔄 Switching to scene: ${slug}`);
    
    // Load new scene
    loadScene(slug, false);
    
    // Update active thumbnail
    updateActiveThumbnail(slug);
    
    // Scroll to active
    setTimeout(() => scrollToActiveThumbnail(), 100);
}

/**
 * Update active thumbnail highlight
 */
function updateActiveThumbnail(slug) {
    document.querySelectorAll('.scene-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.dataset.slug === slug) {
            thumb.classList.add('active');
        }
    });
}

/**
 * Scroll thumbnails left/right
 */
function scrollThumbnails(direction) {
    const container = document.getElementById('thumbnail-container');
    if (!container) return;
    
    const scrollAmount = 300;
    
    if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
    } else {
        container.scrollLeft += scrollAmount;
    }
}

/**
 * Auto-scroll to active thumbnail
 */
function scrollToActiveThumbnail() {
    const container = document.getElementById('thumbnail-container');
    const activeThumb = container?.querySelector('.scene-thumbnail.active');
    
    if (activeThumb && container) {
        const containerWidth = container.offsetWidth;
        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        
        // Calculate scroll position to center the active thumbnail
        const scrollPosition = thumbLeft - (containerWidth / 2) + (thumbWidth / 2);
        
        container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Update location badge in header (now shows scene title)
 */
function updateLocationBadge(scene) {
    const badge = document.getElementById('location-badge');
    if (badge && scene) {
        // Show scene title only (simpler than location_label)
        badge.textContent = scene.title;
        // Show badge when we have content
        badge.style.display = 'block';
        
        // Update menu active state too
        if (typeof populateSceneMenu === 'function') {
            populateSceneMenu();
        }
    } else if (badge) {
        // Hide badge if no scene
        badge.style.display = 'none';
    }
}

/**
 * Toggle scene navigation menu (NUS-style)
 */
function toggleSceneMenu() {
    const menu = document.getElementById('scene-menu-dropdown');
    const toggle = document.getElementById('menu-toggle');
    
    if (!menu || !toggle) return;
    
    const isShown = menu.classList.contains('show');
    
    if (isShown) {
        // Close menu
        menu.classList.remove('show');
        toggle.classList.remove('active');
    } else {
        // Open menu
        menu.classList.add('show');
        toggle.classList.add('active');
        
        // Populate menu if not already done or if scenes updated
        if (state.scenes && state.scenes.length > 0) {
            populateSceneMenu();
        }
    }
}

/**
 * Close scene menu
 */
function closeSceneMenu() {
    const menu = document.getElementById('scene-menu-dropdown');
    const toggle = document.getElementById('menu-toggle');
    
    if (menu) menu.classList.remove('show');
    if (toggle) toggle.classList.remove('active');
}

/**
 * Populate scene navigation menu organized by floor NUMBER (NUS-style)
 * Menu shows: Lantai 1, Lantai 2, ... Lantai 9, Area Outdoor
 */
function populateSceneMenu() {
    const menuContainer = document.getElementById('scene-menu-dropdown');
    if (!menuContainer || !state.scenes) return;
    
    // Group scenes by floor NUMBER only (not building)
    const scenesByFloor = {};
    const outdoorScenes = [];
    
    state.scenes.forEach(scene => {
        if (scene.floor && scene.floor > 0 && scene.floor <= 9) {
            const floorKey = scene.floor; // Just the number
            if (!scenesByFloor[floorKey]) {
                scenesByFloor[floorKey] = [];
            }
            scenesByFloor[floorKey].push(scene);
        } else {
            outdoorScenes.push(scene);
        }
    });
    
    // Build menu HTML - sorted by floor number
    let menuHTML = '';
    
    // Add floor-organized scenes (1-9)
    Object.keys(scenesByFloor)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(floorNum => {
            menuHTML += `<div class="menu-floor-header">Lantai ${floorNum}</div>`;
            scenesByFloor[floorNum].forEach(scene => {
                const isActive = scene.slug === state.currentScene?.slug ? 'active' : '';
                menuHTML += `
                    <div class="menu-item ${isActive}" onclick="selectSceneFromMenu('${scene.slug}')">
                        <i class="menu-item-icon fas fa-door-open"></i>
                        <span class="menu-item-text">${scene.title}</span>
                    </div>
                `;
            });
        });
    
    // Add outdoor/general scenes
    if (outdoorScenes.length > 0) {
        menuHTML += `<div class="menu-floor-header">Area Outdoor</div>`;
        outdoorScenes.forEach(scene => {
            const isActive = scene.slug === state.currentScene?.slug ? 'active' : '';
            menuHTML += `
                <div class="menu-item ${isActive}" onclick="selectSceneFromMenu('${scene.slug}')">
                    <i class="menu-item-icon fas fa-map-marker-alt"></i>
                    <span class="menu-item-text">${scene.title}</span>
                </div>
            `;
        });
    }
    
    menuContainer.innerHTML = menuHTML;
}

/**
 * Select scene from menu dropdown
 */
function selectSceneFromMenu(slug) {
    if (!slug || slug === state.currentScene?.slug) {
        closeSceneMenu();
        return;
    }
    
    console.log(`📍 Selected scene from menu: ${slug}`);
    
    // Close menu
    closeSceneMenu();
    
    // Switch to scene
    switchScene(slug);
}

// Export menu functions
window.toggleSceneMenu = toggleSceneMenu;
window.closeSceneMenu = closeSceneMenu;
window.selectSceneFromMenu = selectSceneFromMenu;
window.populateSceneMenu = populateSceneMenu;

/**
 * Thumbnail Navigation Logic
 */
function populateThumbnailNav() {
    const list = document.getElementById('thumbnail-list');
    if (!list) return;
    
    // Check if scenes exist
    if (!state.scenes || state.scenes.length === 0) {
        console.warn('⚠️ No scenes available to populate thumbnails');
        return;
    }
    
    list.innerHTML = '';
    
    // Group scenes locally (since scenesByFloor is not global)
    const scenesByFloor = {};
    const outdoorScenes = [];
    
    state.scenes.forEach(scene => {
        // Handle floor as number or string
        const floorNum = parseInt(scene.floor);
        
        if (!isNaN(floorNum) && floorNum > 0 && floorNum <= 9) {
            if (!scenesByFloor[floorNum]) {
                scenesByFloor[floorNum] = [];
            }
            scenesByFloor[floorNum].push(scene);
        } else {
            outdoorScenes.push(scene);
        }
    });

    // Combine all scenes for the strip
    const allScenes = [];
    
    // Add floor scenes sorted
    Object.keys(scenesByFloor)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach(floorNum => {
            scenesByFloor[floorNum].forEach(scene => allScenes.push(scene));
        });
        
    // Add outdoor scenes
    outdoorScenes.forEach(scene => allScenes.push(scene));
    
    console.log(`🖼️ Populating thumbnails for ${allScenes.length} scenes`);
    
    // Generate HTML
    allScenes.forEach(scene => {
        const isActive = scene.slug === state.currentScene?.slug ? 'active' : '';
        
        // Try thumbnail first, then full image, then placeholder
        let thumbUrl = scene.thumbnail || scene.image;
        
        // Ensure URL is absolute if needed (though usually handled by backend)
        if (thumbUrl && !thumbUrl.startsWith('http') && !thumbUrl.startsWith('/')) {
             // If it's a relative path without leading slash, might need adjustment?
             // Usually Django returns /media/...
        }
        
        if (!thumbUrl) {
            console.warn(`⚠️ No image for scene: ${scene.title}`);
            thumbUrl = 'https://via.placeholder.com/200x100?text=No+Image';
        }
        
        const item = document.createElement('div');
        item.className = `thumbnail-item ${isActive}`;
        item.onclick = () => switchScene(scene.slug);
        item.innerHTML = `
            <img src="${thumbUrl}" alt="${scene.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x100?text=Error'">
            <div class="thumbnail-title">${scene.title}</div>
        `;
        list.appendChild(item);
    });
}

function scrollThumbnails(direction) {
    const list = document.getElementById('thumbnail-list');
    if (list) {
        const scrollAmount = 300; // Scroll by approx 2 items
        list.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Export thumbnail functions
window.populateThumbnailNav = populateThumbnailNav;
window.scrollThumbnails = scrollThumbnails;

// Export thumbnail navigation functions
window.switchScene = switchScene;
window.scrollThumbnails = scrollThumbnails;
// window.openSceneSelector = openSceneSelector; // Removed: Function not defined
window.updateLocationBadge = updateLocationBadge;
window.loadThumbnailNav = loadThumbnailNav;

// Zoom control functions
window.zoomIn = function() {
    console.log('🔍 Zoom In clicked!', state.viewer);
    if (state.viewer) {
        const currentHfov = state.viewer.getHfov();
        console.log('Current HFOV:', currentHfov);
        state.viewer.setHfov(Math.max(currentHfov - 10, 50));
    } else {
        console.error('❌ Viewer not initialized!');
    }
};

window.zoomOut = function() {
    console.log('🔍 Zoom Out clicked!', state.viewer);
    if (state.viewer) {
        const currentHfov = state.viewer.getHfov();
        console.log('Current HFOV:', currentHfov);
        state.viewer.setHfov(Math.min(currentHfov + 10, 120));
    } else {
        console.error('❌ Viewer not initialized!');
    }
};

window.toggleFullscreen = function() {
    console.log('🖥️ Fullscreen clicked!', state.viewer);
    if (state.viewer) {
        state.viewer.toggleFullscreen();
    } else {
        console.error('❌ Viewer not initialized!');
    }
};
