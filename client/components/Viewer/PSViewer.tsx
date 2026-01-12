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

    // Fetch Scene List on Mount
    useEffect(() => {
        const fetchScenes = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/scenes/');
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
        if (!scene.hotspots) return [];

        const arrowSvg = "data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='dropShadow'%3E%3CfeGaussianBlur in='SourceAlpha' stdDeviation='3'/%3E%3CfeOffset dx='1' dy='1' result='offsetblur'/%3E%3CfeFlood flood-color='rgba(0,0,0,0.5)'/%3E%3CfeComposite in2='offsetblur' operator='in'/%3E%3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3Cpath d='M50 20 L80 60 L50 45 L20 60 Z' fill='url(%23grad1)' stroke='white' stroke-width='3' filter='url(%23dropShadow)'/%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23d4af37;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f9d45e;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3CanimateTransform attributeName='transform' type='translate' values='0 0; 0 -5; 0 0' dur='2s' repeatCount='indefinite' /%3E%3C/svg%3E";

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
        if (url.includes('http://127.0.0.1:8000/media')) {
            return url.replace('http://127.0.0.1:8000/media', '/media');
        } else if (url.includes('http://localhost:8000/media')) {
            return url.replace('http://localhost:8000/media', '/media');
        }
        return url;
    };

    // Load Scene Function (Internal Navigation)
    const loadScene = async (slug: string) => {
        if (isTransitioning || slug === currentScene.slug) return;
        setIsTransitioning(true);
        setLoadError(null);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/scenes/${slug}/`);
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
            touchmoveTwoFingers: true,
            mousewheelCtrlKey: false,
        });

        const markersPlugin = viewer.getPlugin(MarkersPlugin) as MarkersPlugin;

        // DEBUGGING EVENTS
        viewer.addEventListener('ready', () => {
            console.log("PSV Ready");

            // Trigger Little Planet Animation
            if (initialData.is_featured) {
                setTimeout(() => {
                    // Animate to normal view (Zoom in + Look up to horizon)
                    viewer.animate({
                        zoom: 50,
                        pitch: initialData.initial_pitch ? initialData.initial_pitch * (Math.PI / 180) : 0,
                        speed: "50rpm",
                    }).then(() => {
                        // Turn off fisheye after zoom
                        viewer.setOption('fisheye', false);
                    });
                }, 1000); // 1s delay to admire the planet
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

    // Group scenes by building
    const scenesByBuilding: { [key: string]: Scene[] } = {};
    sceneList.forEach(scene => {
        const building = scene.building || 'Lainnya';
        if (!scenesByBuilding[building]) scenesByBuilding[building] = [];
        scenesByBuilding[building].push(scene);
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
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-10 pointer-events-none flex justify-between items-start">
                <div className="pointer-events-auto">
                    <a href="/" className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all border border-white/20 shadow-lg group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="font-medium text-sm">Kembali</span>
                    </a>
                </div>

                <div className="flex flex-col items-end gap-3 pointer-events-auto">
                    <div className="bg-black/60 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 text-center shadow-lg transform transition-all hover:scale-105">
                        <h1 className="text-white font-bold font-display text-sm md:text-base">{currentScene.title}</h1>
                        <p className="text-xs text-gray-400">{currentScene.floor ? `Lantai ${currentScene.floor}` : currentScene.building}</p>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="bg-unu-gold hover:bg-yellow-500 text-black px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-lg font-bold text-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    >
                        <span>☰</span> Daftar Lokasi
                    </button>
                </div>
            </div>

            {/* Loading Overlay */}
            {isTransitioning && (
                <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <div className="w-12 h-12 border-4 border-unu-gold border-b-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold tracking-widest text-sm">MENUJU LOKASI...</p>
                </div>
            )}

            {/* Sidebar */}
            {isMenuOpen && (
                <div className="absolute inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className="relative w-full max-w-sm h-full bg-zinc-900 border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-zinc-950">
                            <h2 className="text-lg font-bold text-unu-gold font-display">Pilih Lokasi</h2>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                            {Object.keys(scenesByBuilding).length === 0 ? (
                                <p className="text-center text-gray-500 py-10">Memuat daftar lokasi...</p>
                            ) : (
                                Object.keys(scenesByBuilding).map((building) => (
                                    <div key={building}>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1 sticky top-0 bg-zinc-900 py-2 z-10 glass-header">
                                            {building}
                                        </h3>
                                        <div className="space-y-2">
                                            {scenesByBuilding[building].map((scene) => (
                                                <button
                                                    key={scene.id}
                                                    onClick={() => loadScene(scene.slug)}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all group border ${scene.slug === currentScene.slug
                                                        ? 'bg-unu-gold/10 border-unu-gold/50'
                                                        : 'hover:bg-white/5 border-transparent hover:border-white/10'
                                                        }`}
                                                >
                                                    <div className="relative w-16 h-12 rounded overflow-hidden bg-black shrink-0">
                                                        {scene.thumbnail ? (
                                                            <img
                                                                src={scene.thumbnail}
                                                                alt={scene.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Img</div>
                                                        )}
                                                    </div>

                                                    <div className="text-left">
                                                        <div className={`font-semibold text-sm ${scene.slug === currentScene.slug ? 'text-unu-gold' : 'text-white group-hover:text-unu-gold'}`}>
                                                            {scene.title}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {scene.floor ? `Lantai ${scene.floor}` : 'Area Luar'}
                                                        </div>
                                                    </div>

                                                    {scene.slug === currentScene.slug && (
                                                        <div className="ml-auto w-2 h-2 rounded-full bg-unu-gold shadow-[0_0_10px_#d4af37]"></div>
                                                    )}
                                                </button>
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
