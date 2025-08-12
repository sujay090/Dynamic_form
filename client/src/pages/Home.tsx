import { useState, useEffect } from 'react';
import { settingsService } from '../API/services/settingsService';
import type { BranchSettings } from '../API/services/settingsService';
import {
    TopBar,
    Header,
    HeroSection,
    ServicesSection,
    AboutSection,
    CTASection,
    Footer
} from '../components/user';

function Home() {
    const [settings, setSettings] = useState<BranchSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isCarouselPaused, setIsCarouselPaused] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    // Auto-rotate carousel images every 5 seconds
    useEffect(() => {
        const backgroundImages = settings?.body?.hero?.backgroundImages || [];
        if (backgroundImages.length > 1 && !isCarouselPaused) {
            const interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
            }, 5000); // Change image every 5 seconds

            return () => clearInterval(interval);
        }
    }, [settings?.body?.hero?.backgroundImages, isCarouselPaused]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsService.getPublicSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextImage = () => {
        const images = settings?.body?.hero?.backgroundImages || [];
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        const images = settings?.body?.hero?.backgroundImages || [];
        if (images.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
            );
        }
    };

    // Smooth scroll to section
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-600">Error loading website content</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes progress {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
                @keyframes fadeInUp {
                  0% {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                .animate-fadeInUp {
                  animation: fadeInUp 0.6s ease-out;
                }
                html {
                  scroll-behavior: smooth;
                }
                :root {
                  --primary-color: ${settings.theme?.primaryColor || '#059669'};
                  --secondary-color: ${settings.theme?.secondaryColor || '#374151'};
                  --accent-color: ${settings.theme?.accentColor || '#dc2626'};
                }
            `}</style>
            <div className="min-h-screen bg-white">
                <TopBar settings={settings} />
                <Header settings={settings} scrollToSection={scrollToSection} />
                <HeroSection
                    settings={settings}
                    currentImageIndex={currentImageIndex}
                    isCarouselPaused={isCarouselPaused}
                    setCurrentImageIndex={setCurrentImageIndex}
                    setIsCarouselPaused={setIsCarouselPaused}
                    nextImage={nextImage}
                    prevImage={prevImage}
                />
                <ServicesSection settings={settings} />
                <AboutSection settings={settings} />
                <CTASection settings={settings} />
                <Footer settings={settings} />
            </div>
        </>
    );
}

export default Home;
