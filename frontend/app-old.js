/**
 * VIRTUAL TOUR UNU YOGYAKARTA - Main Application
 * Connects Django REST API with Pannellum 360° Viewer
 */

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:8000/api',
    ENDPOINTS: {
        scenes: '/scenes/',
        featured: '/scenes/featured/',
        pannellum: '/scenes/pannellum/',
    }
};

// ========================================
// STATE MANAGEMENT
// ========================================
const appState = {
    scenes: [],
    currentScene: null,
    viewer: null,
    isLoading: true,
};

// ========================================
// DOM ELEMENTS
// ========================================
const DOM = {
    loadingScreen: document.getElementById('loading-screen'),
    welcomeOverlay: document.getElementById('welcome-overlay'),
    startTourBtn: document.getElementById('start-tour'),
    panoramaViewer: document.getElementById('panorama-viewer'),
    
    // Info Sidebar
    infoSidebar: document.getElementById('info-sidebar'),
    sceneTitle: document.getElementById('scene-title'),
    sceneLocation: document.getElementById('scene-location'),
    sceneDate: document.getElementById('scene-date'),
    sceneAuthor: document.getElementById('scene-author'),
    sceneDescription: document.getElementById('scene-description'),
    
    // Gallery
    galleryContainer: document.getElementById('gallery-container'),
    thumbnailGallery: document.getElementById('thumbnail-gallery'),
    
    // Buttons
    closeXBtn: document.getElementById('close-x-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
};

// ========================================
// API FUNCTIONS
// ========================================
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showError('Gagal memuat data. Pastikan Django server berjalan di http://127.0.0.1:8000');
        throw error;
    }
}

async function loadScenesList() {
    try {
        const data = await fetchAPI(CONFIG.ENDPOINTS.scenes);
        // DRF might return paginated data or direct array
        const scenes = data.results || data;
        
        // Ensure it's an array
        if (!Array.isArray(scenes)) {
            console.error('API did not return an array:', data);
            return [];
        }
        
        appState.scenes = scenes;
        return scenes;
    } catch (error) {
        console.error('Failed to load scenes list:', error);
        return [];
    }
}

async function loadPannellumConfig() {
    try {
        const config = await fetchAPI(CONFIG.ENDPOINTS.pannellum);
        return config;
    } catch (error) {
        console.error('Failed to load Pannellum config:', error);
        return null;
    }
}

// ========================================
// PANNELLUM VIEWER FUNCTIONS
// ========================================
async function initializePanoramaViewer() {
    showLoading(true, 'Memuat panorama 360°...');
    
    const config = await loadPannellumConfig();
    
    if (!config || !config.scenes) {
        showError('Tidak ada scene yang tersedia. Silakan tambahkan data di Django admin.');
        return;
    }
    
    // Initialize Pannellum
    appState.viewer = pannellum.viewer(DOM.panoramaViewer, config);
    
    // Set up event listeners
    appState.viewer.on('load', function() {
        console.log('Scene loaded successfully');
        updateSceneInfo();
    });
    
    appState.viewer.on('scenechange', function(sceneId) {
        console.log('Scene changed to:', sceneId);
        updateSceneInfo();
        highlightActiveThumbnail(sceneId);
    });
    
    appState.viewer.on('error', function(err) {
        console.error('Pannellum error:', err);
        showError('Error loading panorama. Check console for details.');
    });
    
    showLoading(false);
}

function updateSceneInfo() {
    const currentSceneId = appState.viewer.getScene();
    const scenes = appState.scenes;
    
    // Find current scene from scenes list
    const sceneData = scenes.find(s => s.slug === currentSceneId);
    
    if (sceneData) {
        appState.currentScene = sceneData;
        
        DOM.sceneTitle.textContent = sceneData.title;
        DOM.sceneLocation.textContent = sceneData.location;
        DOM.sceneDate.textContent = formatDate(sceneData.published_date);
        DOM.sceneAuthor.textContent = sceneData.author;
        DOM.sceneDescription.textContent = sceneData.description;
    } else {
        // Fallback: Get info from Pannellum config
        const sceneConfig = appState.viewer.getConfig();
        DOM.sceneTitle.textContent = sceneConfig.title || 'Virtual Tour';
        DOM.sceneDescription.textContent = 'Jelajahi lokasi ini dengan panorama 360°';
    }
}

// ========================================
// GALLERY FUNCTIONS
// ========================================
async function renderThumbnailGallery() {
    const scenes = await loadScenesList();
    
    if (!Array.isArray(scenes) || scenes.length === 0) {
        DOM.thumbnailGallery.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-400">
                <div class="text-center">
                    <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
                    <p>Belum ada scene virtual tour.</p>
                    <p class="text-sm">Tambahkan scene di Django Admin.</p>
                </div>
            </div>
        `;
        return;
    }
    
    DOM.thumbnailGallery.innerHTML = '';
    
    scenes.forEach((scene, index) => {
        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = `relative group cursor-pointer flex-shrink-0 w-48 h-full rounded-xl overflow-hidden border-2 transition-all ${
            scene.is_featured 
            ? 'border-secondary shadow-lg shadow-secondary/50' 
            : 'border-white/20 hover:border-white/50'
        }`;
        thumbnailItem.dataset.slug = scene.slug;
        
        thumbnailItem.innerHTML = `
            <img 
                src="${scene.thumbnail}" 
                alt="${scene.title}"
                class="w-full h-full object-cover transition-transform group-hover:scale-110"
                loading="lazy"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                <div class="p-3 w-full">
                    <h4 class="font-semibold text-sm text-white mb-1 line-clamp-2">${scene.title}</h4>
                    <p class="text-xs text-gray-300 flex items-center gap-1">
                        <i class="fas fa-map-marker-alt text-red-400"></i>
                        ${scene.location}
                    </p>
                </div>
            </div>
            ${scene.is_featured ? '<span class="absolute top-2 right-2 px-2 py-1 bg-secondary text-white text-xs font-bold rounded">Featured</span>' : ''}
        `;
        
        // Click to change scene
        thumbnailItem.addEventListener('click', () => {
            changeScene(scene.slug);
        });
        
        DOM.thumbnailGallery.appendChild(thumbnailItem);
    });
}

function highlightActiveThumbnail(sceneSlug) {
    // Remove active class from all
    document.querySelectorAll('[data-slug]').forEach(item => {
        item.classList.remove('border-secondary', 'shadow-lg', 'shadow-secondary/50');
        item.classList.add('border-white/20');
    });
    
    // Add active class to current
    const activeItem = document.querySelector(`[data-slug="${sceneSlug}"]`);
    if (activeItem) {
        activeItem.classList.remove('border-white/20');
        activeItem.classList.add('border-secondary', 'shadow-lg', 'shadow-secondary/50');
    }
}

function changeScene(sceneSlug) {
    if (appState.viewer) {
        appState.viewer.loadScene(sceneSlug);
    }
}

// ========================================
// UI TOGGLE FUNCTIONS
// ========================================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
        });
        DOM.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> <span>Exit</span>';
    } else {
        document.exitFullscreen();
        DOM.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> <span>Fullscreen</span>';
    }
}

// ========================================
// LOADING & ERROR FUNCTIONS
// ========================================
function showLoading(show, message = 'Memuat Virtual Tour...') {
    if (show) {
        DOM.loadingScreen.classList.remove('hidden');
    } else {
        setTimeout(() => {
            DOM.loadingScreen.classList.add('hidden');
        }, 500);
    }
}

function showError(message) {
    alert(`❌ Error:\n\n${message}\n\nCek browser console untuk detail.`);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Welcome overlay
    DOM.startTourBtn.addEventListener('click', () => {
        DOM.welcomeOverlay.classList.add('hidden');
    });
    
    // Close X button (reload page)
    DOM.closeXBtn.addEventListener('click', () => {
        location.reload();
    });
    
    // Fullscreen
    DOM.fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Fullscreen change listener
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            DOM.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> <span>Fullscreen</span>';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'Escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
            case 'f':
            case 'F':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleFullscreen();
                }
                break;
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================
async function initApp() {
    console.log('🚀 Initializing Virtual Tour App...');
    
    showLoading(true, 'Memuat data virtual tour...');
    
    try {
        // Setup event listeners
        setupEventListeners();
        
        // Load and render gallery
        await renderThumbnailGallery();
        
        // Initialize panorama viewer
        await initializePanoramaViewer();
        
        console.log('✅ App initialized successfully');
        console.log('📊 Loaded scenes:', appState.scenes.length);
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showError('Gagal menginisialisasi aplikasi. Pastikan:\n1. Django server berjalan (python manage.py runserver)\n2. Data scenes sudah ada (jalankan generate_dummy_data.py)\n3. CORS diaktifkan di Django');
    } finally {
        showLoading(false);
    }
}

// ========================================
// START APPLICATION
// ========================================
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ========================================
// CONSOLE INFO
// ========================================
console.log(`
╔═══════════════════════════════════════════╗
║   VIRTUAL TOUR UNU YOGYAKARTA            ║
║   Powered by Django + Pannellum.js       ║
║   UI: Tailwind CSS (Modern Design)       ║
╚═══════════════════════════════════════════╝

📚 Keyboard Shortcuts:
   • Ctrl+F  : Toggle Fullscreen
   • ESC     : Exit Fullscreen

🔗 API Endpoints:
   • ${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.scenes}
   • ${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.featured}
   • ${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.pannellum}

🎯 Debug:
   • appState.viewer       : Pannellum instance
   • appState.scenes       : All scenes data
   • appState.currentScene : Current scene data

🎨 UI Framework:
   • Tailwind CSS (CDN)
   • Layout: Indonesia Virtual Tour Style
`);
