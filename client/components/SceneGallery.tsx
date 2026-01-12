
import Link from "next/link";
import { Scene } from "@/types/scene";

async function getScenes(): Promise<Scene[]> {
    // Try fetching from the backend directly
    const res = await fetch('http://127.0.0.1:8000/api/scenes/', { cache: 'no-store' });

    if (!res.ok) {
        throw new Error('Failed to fetch scenes');
    }

    return res.json();
}

export default async function SceneGallery() {
    let scenes: Scene[] = [];
    try {
        scenes = await getScenes();
    } catch (error) {
        console.error("Error fetching scenes:", error);
        // Return empty or error state
        return (
            <div className="text-center text-red-400 py-10">
                <p>Gagal memuat data scene. Pastikan backend Django berjalan.</p>
            </div>
        );
    }

    // Group by Building
    const buildings: { [key: string]: Scene[] } = {};
    scenes.forEach(scene => {
        const buildingName = scene.building || "Lainnya";
        if (!buildings[buildingName]) {
            buildings[buildingName] = [];
        }
        buildings[buildingName].push(scene);
    });

    return (
        <div className="space-y-16">
            {Object.keys(buildings).map((buildingName) => (
                <div key={buildingName} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold text-unu-gold font-display border-l-4 border-unu-gold pl-4">
                            {buildingName}
                        </h3>
                        <div className="h-px bg-white/10 flex-grow"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {buildings[buildingName].map((scene) => (
                            <Link href={`/tour/${scene.slug}`} key={scene.id} className="group relative bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700/50 hover:border-unu-gold/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-unu-gold/10">

                                {/* Thumbnail Image */}
                                <div className="h-56 relative overflow-hidden bg-zinc-900">
                                    {scene.thumbnail ? (
                                        <img
                                            src={scene.thumbnail}
                                            alt={scene.title}
                                            className="min-w-full min-h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                                            <span className="text-4xl text-zinc-700">📷</span>
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                                    {/* Badge Location */}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <span className="text-xs font-semibold text-white">
                                            {scene.floor ? `Lantai ${scene.floor}` : 'Outdoor'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-unu-gold transition-colors line-clamp-1">
                                        {scene.title}
                                    </h4>
                                    <p className="text-gray-400 text-sm line-clamp-2">
                                        {scene.floor_description || scene.description || "Jelajahi area ini dalam tampilan 360 derajat."}
                                    </p>

                                    <div className="mt-4 flex items-center text-unu-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                        Mulai Tur <span className="ml-1">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
