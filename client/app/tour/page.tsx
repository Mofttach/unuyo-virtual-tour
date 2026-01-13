'use client';

import { useEffect, useState } from 'react';
import PSViewer from '@/components/Viewer/PSViewer';
import { Scene } from '@/types/scene';

export default function TourIndexPage() {
    const [startScene, setStartScene] = useState<Scene | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch featured scene to start the tour
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                const res = await fetch(`${apiUrl}/api/scenes/featured/`);
                if (res.ok) {
                    const data = await res.json();
                    setStartScene(data);
                } else {
                    setError("Gagal memuat lokasi awal.");
                }
            } catch (error) {
                console.error("Failed to fetch featured scene:", error);
                setError("Gagal menghubungkan ke server.");
            }
        };

        fetchFeatured();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center px-4">
                    <p className="text-red-500 mb-4">⚠️ {error}</p>
                    <a href="/" className="px-4 py-2 bg-white/10 rounded hover:bg-white/20">Kembali ke Beranda</a>
                </div>
            </div>
        );
    }

    if (!startScene) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-unu-gold border-t-transparent rounded-full animate-spin"></div>
                    <p>Memuat Virtual Tour...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black">
            <PSViewer initialData={startScene} />
        </main>
    );
}
