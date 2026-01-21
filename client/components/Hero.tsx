import Link from "next/link";

const Hero = () => {
    // Hardcode link to main tour as requested ("tetep pakai /gedung-utama")
    const tourLink = "/tour/gedung-utama";

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 z-0">
                <div className="relative w-full h-full transform scale-110 transition-transform duration-1000">
                    <img
                        src="/bg-hero-wide.webp"
                        alt="Background"
                        className="w-full h-full object-cover object-bottom"
                    />
                </div>
                {/* Dark Overlay - Adjusted to match screenshot darkness */}
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Floating Logo (Top Left) */}
            <a href="https://unu-jogja.ac.id" target="_blank" className="fixed top-4 left-4 md:top-8 md:left-8 z-50 transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-left">
                <img
                    src="/gold-unu.png"
                    alt="Logo UNU Yogyakarta"
                    className="h-8 md:h-10 lg:h-12 w-auto drop-shadow-lg"
                />
            </a>

            {/* PMB Button (Top Right) */}
            <a href="https://pmb.unu-jogja.ac.id" target="_blank"
                className="fixed top-4 right-4 md:top-8 md:right-8 z-50 px-4 py-2 md:px-8 md:py-2.5 border-2 border-unu-gold text-unu-gold bg-transparent rounded-full font-bold text-xs md:text-sm tracking-wide hover:bg-unu-gold hover:text-black transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-right">
                PMB UNU
            </a>

            {/* Hero Content */}
            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white mt-[-5vh]">

                {/* Main Tagline */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl mb-3 md:mb-4 font-display font-normal tracking-wide text-white drop-shadow-md leading-tight">
                    Start Your Virtual Exploration<br />of UNU Yogyakarta.
                </h1>

                {/* 360 Badge - Text Only, No Box */}
                <div className="mb-8 md:mb-10">
                    <span className="text-xs md:text-sm lg:text-base tracking-[0.2em] md:tracking-[0.3em] font-light uppercase text-white/90 shadow-black drop-shadow-md">
                        360° VIRTUAL TOUR
                    </span>
                </div>

                {/* CTA Button - Solid Gold Pill */}
                <Link href={tourLink}
                    className="inline-block bg-[#d4af37] text-black font-bold text-xs md:text-sm px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg hover:bg-[#eac455] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:transform hover:scale-110 transition-all duration-300 tracking-wider active:scale-95 animate-in fade-in zoom-in-95 delay-300">
                    EXPLORE THE CAMPUS
                </Link>
            </div>
        </section>
    );
}

export default Hero;
