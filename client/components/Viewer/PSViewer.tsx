'use client';

import { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { Scene } from '@/types/scene';

interface PSViewerProps {
    initialData: Scene;
}

const PSViewer = ({ initialData }: PSViewerProps) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const viewerInstance = useRef<Viewer | null>(null);

    // State
    const [currentScene, setCurrentScene] = useState<Scene>(initialData);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sceneList, setSceneList] = useState<Scene[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    // Fetch Scene List on Mount
    useEffect(() => {
        const fetchScenes = async () => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            try {
                const res = await fetch(`${baseUrl}/api/scenes/`);
                if (res.ok) {
                    const data = await res.json();
                    setSceneList(data);
                }
            } catch (error) {
                console.error("Failed to fetch scene list:", error);
            }
        };
        fetchScenes();
    }, []);

    // Helper: Create Markers Data
    const createMarkers = (scene: Scene) => {
        if (!scene.hotspots || scene.hotspots.length === 0) {
            console.log("No hotspots for scene:", scene.slug);
            return [];
        }

        console.log("Creating markers for:", scene.slug, scene.hotspots);

        // Solid Color Arrow (Simpler, robust)
        const arrowSvg = "data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='dropShadow'%3E%3CfeGaussianBlur in='SourceAlpha' stdDeviation='3'/%3E%3CfeOffset dx='1' dy='1' result='offsetblur'/%3E%3CfeFlood flood-color='rgba(0,0,0,0.5)'/%3E%3CfeComposite in2='offsetblur' operator='in'/%3E%3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3Cpath d='M50 20 L80 60 L50 45 L20 60 Z' fill='%23d4af37' stroke='white' stroke-width='3' filter='url(%23dropShadow)'/%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0; 0 -5; 0 0' dur='2s' repeatCount='indefinite' /%3E%3C/svg%3E";

        const infoSvg = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='18' fill='%23E74C3C' stroke='white' stroke-width='2'/%3E%3Cpath d='M30 24V26M30 28V36' stroke='white' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E";

        return (scene.hotspots || []).map(h => ({
            id: `hotspot-${h.id}`,
            position: { yaw: h.yaw, pitch: h.pitch },
            image: h.hotspot_type === 'scene' ? arrowSvg : infoSvg,
            size: { width: h.hotspot_type === 'scene' ? 80 : 50, height: h.hotspot_type === 'scene' ? 80 : 50 },
            anchor: 'bottom center',
            tooltip: {
                content: `<div class="font-sans font-bold text-sm bg-black/80 text-white px-3 py-1 rounded backdrop-blur-sm border border-unu-gold/30">${h.text}</div>`,
                position: 'top',
                className: 'custom-tooltip'
            },
            data: {
                type: h.hotspot_type,
                targetSlug: h.to_scene_slug,
                description: h.info_description
            }
        }));
    };

    // Correct URL for Proxy
    const getProxyUrl = (url: string) => {
        if (!url) return '';
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

        // Remove backend domain to simply use /media (Next.js Rewrite proxy)
        if (url.startsWith(baseUrl)) {
            return url.replace(baseUrl, '');
        }

        // Fallback for hardcoded localhost in DB
        if (url.includes('http://127.0.0.1:8000/media')) {
            return url.replace('http://127.0.0.1:8000/media', '/media');
        }
        return url;
    };

    // Load Scene Function (Internal Navigation)
    const loadScene = async (slug: string) => {
        if (isTransitioning || slug === currentScene.slug) return;
        setIsTransitioning(true);
        setLoadError(null);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

        try {
            const res = await fetch(`${baseUrl}/api/scenes/${slug}/`);
            if (!res.ok) throw new Error("Scene load failed");
            const newSceneData: Scene = await res.json();

            if (viewerInstance.current) {
                const panoUrl = getProxyUrl(newSceneData.panorama_image || '');

                await viewerInstance.current.setPanorama(panoUrl, {
                    transition: true,
                    showLoader: false,
                    zoom: 50
                });

                const markersPlugin = viewerInstance.current.getPlugin(MarkersPlugin) as MarkersPlugin;
                markersPlugin.clearMarkers();
                createMarkers(newSceneData).forEach(m => markersPlugin.addMarker(m));

                viewerInstance.current.rotate({
                    yaw: newSceneData.initial_yaw ? newSceneData.initial_yaw * (Math.PI / 180) : 0,
                    pitch: newSceneData.initial_pitch ? newSceneData.initial_pitch * (Math.PI / 180) : 0
                });

                setCurrentScene(newSceneData);
                // window.history.pushState({}, '', `/tour/${slug}`); // SPA Mode: Disable URL updates
            }
        } catch (error) {
            console.error("Transition failed:", error);
            setLoadError("Gagal memuat scene.");
            alert("Gagal memuat scene.");
        } finally {
            setIsTransitioning(false);
            setIsMenuOpen(false);
        }
    };

    // Initialize Viewer
    useEffect(() => {
        if (!viewerRef.current || viewerInstance.current) return;

        const panoramaUrl = getProxyUrl(initialData.panorama_image || '');
        console.log("Initializing PSV with:", panoramaUrl);

        const isFeatured = initialData.is_featured;

        const viewer = new Viewer({
            container: viewerRef.current,
            panorama: panoramaUrl,
            caption: initialData.title,
            navbar: false,
            defaultYaw: initialData.initial_yaw ? initialData.initial_yaw * (Math.PI / 180) : 0,
            // Little Planet: Start looking completely DOWN (-90deg/ -PI/2)
            defaultPitch: isFeatured ? -Math.PI / 2 : (initialData.initial_pitch ? initialData.initial_pitch * (Math.PI / 180) : 0),

            // Little Planet Configuration
            fisheye: isFeatured ? 2 : 0,
            defaultZoomLvl: isFeatured ? 0 : 50,

            plugins: [
                [MarkersPlugin, {
                    markers: createMarkers(initialData),
                }],
            ],
            loadingTxt: 'Memuat 360°...',
            touchmoveTwoFingers: false, // Allow single finger navigation on mobile
            mousewheelCtrlKey: false,
        });

        const markersPlugin = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;

        // DEBUGGING EVENTS
        viewer.addEventListener('ready', () => {
            console.log("PSV Ready");

            // Trigger Little Planet Animation
            if (initialData.is_featured) {
                setTimeout(() => {
                    // Animate to normal horizontal view (looking straight, not down)
                    viewer.animate({
                        zoom: 50,
                        pitch: 0, // Horizontal view (0 degrees)
                        yaw: initialData.initial_yaw ? initialData.initial_yaw * (Math.PI / 180) : 0,
                        speed: "50rpm",
                    }).then(() => {
                        // Turn off fisheye after zoom for normal viewing
                        viewer.setOption('fisheye', false);
                    });
                }, 1500); // 1.5s delay to show the planet effect
            }
        });

        // Using 'load-progress' to debug loading
        viewer.addEventListener('load-progress', (e: any) => {
            console.log(`Loading: ${e.progress}%`);
        });

        // CRITICAL FOR DEBUGGING: Catch load errors
        // Note: PSV might not expose a simple 'error' event for textures in all versions, 
        // but we rely on the internal loader. 
        // If getting 404/403, browser console is best.

        // Manual check: Fetch the image first to verify access before giving it to viewer?
        // No, that's heavy. Let's trust the proxy.

        // Manual Error Trap might be needed if PSV fails silently

        markersPlugin.addEventListener('select-marker', (e) => {
            const { marker } = e;
            const data = marker.data as any;

            if (data.type === 'scene' && data.targetSlug) {
                loadScene(data.targetSlug);
            } else if (data.type === 'info') {
                alert(data.description || marker.config.tooltip?.content);
            }
        });

        viewerInstance.current = viewer;

        return () => {
            viewerInstance.current?.destroy();
            viewerInstance.current = null;
        };
    }, []);

    // Group scenes by building and floor
    const scenesByBuildingFloor: { [building: string]: { [floor: string]: Scene[] } } = {};
    sceneList.forEach(scene => {
        const building = scene.building || 'Lainnya';
        const floor = scene.floor ? `Lantai ${scene.floor}` : 'Area Outdoor';
        
        if (!scenesByBuildingFloor[building]) {
            scenesByBuildingFloor[building] = {};
        }
        if (!scenesByBuildingFloor[building][floor]) {
            scenesByBuildingFloor[building][floor] = [];
        }
        scenesByBuildingFloor[building][floor].push(scene);
    });

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
            <div ref={viewerRef} className="w-full h-full text-black transition-opacity duration-500 ease-in-out"></div>

            {/* ERROR UI */}
            {loadError && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-red-500 font-bold">
                    <p>{loadError}</p>
                </div>
            )}

            {/* Top Overlay UI */}
            <div className="absolute top-0 left-0 w-full p-2 md:p-4 z-10 pointer-events-none">
                <div className="flex justify-between items-start gap-2">
                    {/* Left: Menu Button */}
                    <div className="pointer-events-auto">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="w-9 h-9 md:w-10 md:h-10 bg-black/70 backdrop-blur-md hover:bg-black/90 text-white rounded-lg flex items-center justify-center transition-all duration-300 border border-white/20 shadow-lg hover:scale-110 active:scale-95"
                            title="Daftar Lokasi"
                        >
                            <span className="text-base md:text-lg">☰</span>
                        </button>
                    </div>

                    {/* Center: Scene Title */}
                    <div className="pointer-events-auto flex-1 flex justify-center px-1 md:px-4">
                        <div className="bg-black/70 backdrop-blur-md px-3 py-2 md:px-6 md:py-3 rounded-lg border border-white/20 text-center shadow-lg max-w-md transition-all duration-300 hover:bg-black/80">
                            <h1 className="text-white font-bold text-xs md:text-base truncate">{currentScene.title}</h1>
                        </div>
                    </div>

                    {/* Right: Control Buttons */}
                    <div className="flex flex-col gap-1.5 md:gap-2 pointer-events-auto relative">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-9 h-9 md:w-10 md:h-10 bg-black/70 backdrop-blur-md hover:bg-black/90 text-white rounded-lg flex items-center justify-center transition-all duration-300 border border-white/20 shadow-lg hover:scale-110 active:scale-95 hover:rotate-90"
                            title="Kembali"
                        >
                            <span className="text-base md:text-lg">✕</span>
                        </button>
                        
                        <button
                            onClick={() => viewerInstance.current?.zoom(10)}
                            className="w-9 h-9 md:w-10 md:h-10 bg-black/70 backdrop-blur-md hover:bg-black/90 text-white rounded-lg flex items-center justify-center transition-all duration-300 border border-white/20 shadow-lg hover:scale-110 active:scale-95"
                            title="Zoom In"
                        >
                            <span className="text-base md:text-lg font-bold">+</span>
                        </button>
                        
                        <button
                            onClick={() => viewerInstance.current?.zoom(-10)}
                            className="w-9 h-9 md:w-10 md:h-10 bg-black/70 backdrop-blur-md hover:bg-black/90 text-white rounded-lg flex items-center justify-center transition-all duration-300 border border-white/20 shadow-lg hover:scale-110 active:scale-95"
                            title="Zoom Out"
                        >
                            <span className="text-base md:text-lg font-bold">−</span>
                        </button>
                        
                        <button
                            onClick={() => {
                                const elem = viewerRef.current?.parentElement;
                                if (elem) {
                                    if (!document.fullscreenElement) {
                                        elem.requestFullscreen();
                                    } else {
                                        document.exitFullscreen();
                                    }
                                }
                            }}
                            className="w-9 h-9 md:w-10 md:h-10 bg-black/70 backdrop-blur-md hover:bg-black/90 text-white rounded-lg flex items-center justify-center transition-all duration-300 border border-white/20 shadow-lg hover:scale-110 active:scale-95"
                            title="Fullscreen"
                        >
                            <span className="text-sm md:text-base">⛶</span>
                        </button>
                        
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className={`w-9 h-9 md:w-10 md:h-10 backdrop-blur-md text-white rounded-lg flex items-center justify-center transition-all duration-300 border shadow-lg hover:scale-110 active:scale-95 ${
                                showInfo 
                                    ? 'bg-unu-gold/90 border-unu-gold text-black' 
                                    : 'bg-black/70 hover:bg-black/90 border-white/20'
                            }`}
                            title="Informasi"
                        >
                            <span className="text-sm md:text-base font-bold">i</span>
                        </button>

                        {/* Info Card - Floating next to button (Mobile: below, Desktop: left side) */}
                        {showInfo && (
                            <>
                                <div
                                    className="fixed inset-0 z-0"
                                    onClick={() => setShowInfo(false)}
                                ></div>
                                <div className="absolute top-full md:top-0 right-0 md:right-full mt-2 md:mt-0 md:mr-3 w-72 md:w-80 bg-zinc-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-unu-gold/30 animate-in slide-in-from-top md:slide-in-from-right fade-in duration-300 z-10">
                                    <div className="bg-unu-gold px-4 py-3 rounded-t-lg">
                                        <h3 className="font-bold text-black text-sm md:text-base">{currentScene.title}</h3>
                                    </div>
                                    <div className="p-4 max-h-48 md:max-h-64 overflow-y-auto custom-scrollbar">
                                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                                            {currentScene.description || 'Tidak ada deskripsi untuk lokasi ini.'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isTransitioning && (
                <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <div className="w-12 h-12 border-4 border-unu-gold border-b-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold tracking-widest text-sm">MENUJU LOKASI...</p>
                </div>
            )}

            {/* Sidebar - Left Side */}
            {isMenuOpen && (
                <div className="absolute inset-0 z-50 flex justify-start">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className="relative w-full sm:max-w-sm md:max-w-md h-full bg-gradient-to-b from-zinc-900 to-black border-r border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="p-4 md:p-6 border-b border-unu-gold/30 bg-gradient-to-r from-zinc-950 to-zinc-900">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg md:text-xl font-bold text-unu-gold font-display tracking-wide">Pilih Lokasi</h2>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-unu-gold/10 hover:bg-unu-gold/20 text-unu-gold border border-unu-gold/30 transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 custom-scrollbar">
                            {Object.keys(scenesByBuildingFloor).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <div className="w-12 h-12 border-4 border-unu-gold/30 border-t-unu-gold rounded-full animate-spin mb-4"></div>
                                    <p className="text-xs md:text-sm">Memuat daftar lokasi...</p>
                                </div>
                            ) : (
                                Object.keys(scenesByBuildingFloor).map((building) => (
                                    <div key={building} className="bg-zinc-800/50 rounded-xl border border-white/5 overflow-hidden backdrop-blur-sm">
                                        <div className="px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-zinc-800 to-zinc-900 border-b border-white/10">
                                            <h3 className="text-xs md:text-sm font-bold text-unu-gold uppercase tracking-wider flex items-center gap-2">
                                                <span className="w-1 h-3 md:h-4 bg-unu-gold rounded-full"></span>
                                                {building}
                                            </h3>
                                        </div>
                                        
                                        <div className="p-1.5 md:p-2 space-y-2 md:space-y-3">
                                            {Object.keys(scenesByBuildingFloor[building])
                                                .sort((a, b) => {
                                                    // Sort floors numerically
                                                    const floorA = a.match(/\d+/) ? parseInt(a.match(/\d+/)![0]) : 0;
                                                    const floorB = b.match(/\d+/) ? parseInt(b.match(/\d+/)![0]) : 0;
                                                    return floorA - floorB;
                                                })
                                                .map((floor) => (
                                                <div key={floor} className="space-y-1">
                                                    <div className="px-2 py-1">
                                                        <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wide">{floor}</p>
                                                    </div>
                                                    {scenesByBuildingFloor[building][floor].map((scene) => (
                                                        <button
                                                            key={scene.id}
                                                            onClick={() => loadScene(scene.slug)}
                                                            className={`w-full flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-lg transition-all duration-300 group ${
                                                                scene.slug === currentScene.slug
                                                                    ? 'bg-gradient-to-r from-unu-gold/20 to-unu-gold/10 border border-unu-gold/50 shadow-lg shadow-unu-gold/20'
                                                                    : 'hover:bg-white/5 border border-transparent hover:border-white/10 hover:translate-x-1'
                                                            }`}
                                                        >
                                                            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-black shrink-0 ring-1 ring-white/10">
                                                                {scene.thumbnail ? (
                                                                    <img
                                                                        src={scene.thumbnail}
                                                                        alt={scene.title}
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                                                                        <span className="text-xl md:text-2xl">🏛️</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 text-left min-w-0">
                                                                <div className={`font-semibold text-xs md:text-sm transition-colors duration-300 truncate ${
                                                                    scene.slug === currentScene.slug ? 'text-unu-gold' : 'text-white group-hover:text-unu-gold'
                                                                }`}>
                                                                    {scene.title}
                                                                </div>
                                                            </div>

                                                            {scene.slug === currentScene.slug && (
                                                                <div className="ml-auto shrink-0">
                                                                    <div className="w-2 h-2 rounded-full bg-unu-gold shadow-[0_0_10px_#d4af37] animate-pulse"></div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PSViewer;
