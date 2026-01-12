import Hero from "@/components/Hero";
import SceneGallery from "@/components/SceneGallery";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-unu-gold selection:text-black">
      <Hero />

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-zinc-900 min-h-screen">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-16">
            <span className="block text-unu-gold text-sm font-bold tracking-widest uppercase mb-2">Destinasi</span>
            <span className="text-3xl md:text-4xl font-display font-bold text-white">Jelajahi Sudut Kampus</span>
          </h2>

          <Suspense fallback={
            <div className="text-center py-20 text-gray-500 animate-pulse">
              Memuat daftar lokasi...
            </div>
          }>
            <SceneGallery />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
