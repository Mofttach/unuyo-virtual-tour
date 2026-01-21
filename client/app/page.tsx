import Hero from "@/components/Hero";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-unu-gold selection:text-black">
      <Hero />
    </main>
  );
}
