import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '../ui/button';
import type { BranchSettings } from '../../API/services/settingsService';

interface HeroSectionProps {
    settings: BranchSettings;
    currentImageIndex: number;
    isCarouselPaused: boolean;
    setCurrentImageIndex: (index: number) => void;
    setIsCarouselPaused: (paused: boolean) => void;
    nextImage: () => void;
    prevImage: () => void;
}

export const HeroSection = ({
    settings,
    currentImageIndex,
    isCarouselPaused,
    setCurrentImageIndex,
    setIsCarouselPaused,
    nextImage,
    prevImage
}: HeroSectionProps) => {
    return (
        <section
            id="hero"
            className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
        >
            {/* Simple Background */}
            <div className="absolute inset-0 z-0">
                {(() => {
                    const backgroundImages = settings.body?.hero?.backgroundImages || [];
                    const singleBackground = settings.body?.hero?.backgroundImage;

                    if (backgroundImages.length > 0) {
                        return backgroundImages.map((image, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <img
                                    src={image}
                                    alt={`Background ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ));
                    }
                    else if (singleBackground) {
                        return (
                            <img
                                src={singleBackground}
                                alt="Background"
                                className="w-full h-full object-cover"
                            />
                        );
                    }
                    else {
                        return (
                            <div
                                className="w-full h-full"
                                style={{
                                    background: `linear-gradient(135deg, ${settings.theme?.primaryColor || '#059669'}, ${settings.theme?.secondaryColor || '#374151'})`
                                }}
                            />
                        );
                    }
                })()}

                {/* Simple overlay */}
                <div className="absolute inset-0 bg-black/40 z-1"></div>
            </div>

            {/* Simple Carousel Controls */}
            {(() => {
                const backgroundImages = settings.body?.hero?.backgroundImages || [];
                return backgroundImages.length > 1 && (
                    <>
                        <button
                            onClick={() => {
                                prevImage();
                                setIsCarouselPaused(true);
                                setTimeout(() => setIsCarouselPaused(false), 3000);
                            }}
                            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
                        >
                            <ChevronLeft className="text-gray-800" size={24} />
                        </button>
                        <button
                            onClick={() => {
                                nextImage();
                                setIsCarouselPaused(true);
                                setTimeout(() => setIsCarouselPaused(false), 3000);
                            }}
                            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
                        >
                            <ChevronRight className="text-gray-800" size={24} />
                        </button>
                    </>
                );
            })()}

            {/* Clean Hero Content */}
            <div className="relative z-30 text-center text-white px-6 max-w-5xl mx-auto">
                <div>
                    {settings.body?.hero?.title ? (
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                            {settings.body.hero.title}
                        </h1>
                    ) : (
                        <div className="mb-6">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
                                Professional Institute
                            </h1>
                            <p className="text-lg text-white/80 drop-shadow-md">Configure your title in settings</p>
                        </div>
                    )}

                    {settings.body?.hero?.subtitle ? (
                        <p className="text-xl md:text-2xl mb-10 leading-relaxed text-white/90 max-w-4xl mx-auto font-light drop-shadow-md">
                            {settings.body.hero.subtitle}
                        </p>
                    ) : (
                        <div className="mb-10">
                            <p className="text-lg text-white/80 max-w-3xl mx-auto font-light drop-shadow-md">
                                Add your subtitle content in settings to showcase your institute
                            </p>
                        </div>
                    )}

                    {/* Professional CTA Button */}
                    {settings.body?.hero?.ctaButton?.isVisible && settings.body.hero.ctaButton.text ? (
                        <Button
                            size="lg"
                            className="text-lg px-10 py-4 text-white font-semibold rounded-xl shadow-lg"
                            style={{
                                background: `linear-gradient(135deg, ${settings.theme?.primaryColor || '#059669'}, ${settings.theme?.accentColor || '#dc2626'})`
                            }}
                            onClick={() => {
                                if (settings.body?.hero?.ctaButton?.url) {
                                    window.location.href = settings.body.hero.ctaButton.url;
                                }
                            }}
                        >
                            <Users className="mr-3" size={20} />
                            {settings.body.hero.ctaButton.text}
                        </Button>
                    ) : (
                        <div className="inline-block px-8 py-4 bg-white/20 rounded-xl border-2 border-dashed border-white/40">
                            <p className="text-white/80 font-medium">Configure CTA Button in Settings</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Simple Progress Bar */}
            {(() => {
                const backgroundImages = settings.body?.hero?.backgroundImages || [];
                return backgroundImages.length > 1 && !isCarouselPaused && (
                    <div className="absolute bottom-4 left-0 right-0 z-20 px-8">
                        <div className="w-full h-1 bg-white/30 rounded-full">
                            <div
                                className="h-full rounded-full transition-all duration-75 ease-linear"
                                style={{
                                    width: `${((currentImageIndex + 1) / backgroundImages.length) * 100}%`,
                                    backgroundColor: settings.theme?.primaryColor || '#059669',
                                    animation: isCarouselPaused ? 'none' : 'progress 5000ms linear infinite'
                                }}
                            />
                        </div>
                    </div>
                );
            })()}

            {/* Simple Indicators */}
            {(() => {
                const backgroundImages = settings.body?.hero?.backgroundImages || [];
                return backgroundImages.length > 1 && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
                        {backgroundImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setIsCarouselPaused(true);
                                    setTimeout(() => setIsCarouselPaused(false), 3000);
                                }}
                                className={`transition-all duration-300 rounded-full ${index === currentImageIndex
                                    ? 'w-8 h-3 shadow-lg'
                                    : 'w-3 h-3 bg-white/60 hover:bg-white/80'
                                    }`}
                                style={{
                                    backgroundColor: index === currentImageIndex
                                        ? settings.theme?.primaryColor || '#059669'
                                        : undefined
                                }}
                            />
                        ))}
                    </div>
                );
            })()}
        </section>
    );
};
