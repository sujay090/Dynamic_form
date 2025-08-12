import { BookOpen, Phone } from 'lucide-react';
import type { BranchSettings } from '../../API/services/settingsService';

interface HeaderProps {
    settings: BranchSettings;
    scrollToSection: (sectionId: string) => void;
}

export const Header = ({ settings, scrollToSection }: HeaderProps) => {
    return (
        <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between py-4">
                    {/* Enhanced Logo & Site Name with Animation */}
                    <div className="flex items-center space-x-4 group cursor-pointer">
                        {settings.header?.logo ? (
                            <div className="relative">
                                <img
                                    src={settings.header.logo}
                                    alt="Institute Logo"
                                    className="h-16 w-16 object-contain rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300"
                                />
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                                    style={{
                                        background: `linear-gradient(135deg, ${settings.theme?.primaryColor || 'var(--primary-color)'}, ${settings.theme?.accentColor || 'var(--accent-color)'})`
                                    }}
                                ></div>
                            </div>
                        ) : (
                            <div
                                className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-500"
                                style={{
                                    background: `linear-gradient(135deg, ${settings.theme?.primaryColor || 'var(--primary-color)'}, ${settings.theme?.accentColor || 'var(--accent-color)'})`
                                }}
                            >
                                <BookOpen className="text-white transform group-hover:scale-110 transition-transform duration-300" size={32} />
                            </div>
                        )}
                        <div className="group-hover:translate-x-1 transition-transform duration-300">
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-gray-800 transition-colors duration-300">
                                {settings.header?.siteName || "Institute"}
                            </h1>
                            {settings.header?.tagline && (
                                <p
                                    className="font-medium text-sm opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                >
                                    {settings.header.tagline}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Modern Navigation with Enhanced Effects */}
                    {settings.header?.navigation && settings.header.navigation.length > 0 && (
                        <nav className="hidden md:flex items-center space-x-2">
                            {settings.header.navigation
                                .filter(nav => nav.isActive)
                                .sort((a, b) => a.order - b.order)
                                .map((navItem, index) => {
                                    const isScrollLink = navItem.url.startsWith('#') ||
                                        navItem.title.toLowerCase() === 'home' ||
                                        navItem.title.toLowerCase() === 'about' ||
                                        navItem.title.toLowerCase() === 'services' ||
                                        navItem.title.toLowerCase() === 'contact';

                                    if (isScrollLink) {
                                        let sectionId = navItem.url.replace('#', '');

                                        if (navItem.title.toLowerCase() === 'home') sectionId = 'hero';
                                        if (navItem.title.toLowerCase() === 'about') sectionId = 'about';
                                        if (navItem.title.toLowerCase() === 'services') sectionId = 'services';
                                        if (navItem.title.toLowerCase() === 'contact') sectionId = 'contact';

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => scrollToSection(sectionId)}
                                                className="relative text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:text-white hover:-translate-y-1 hover:shadow-lg group overflow-hidden"
                                                style={{
                                                    background: 'linear-gradient(145deg, transparent, transparent)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = `linear-gradient(145deg, ${settings.theme?.primaryColor || 'var(--primary-color)'}, ${settings.theme?.accentColor || 'var(--accent-color)'})`;
                                                    e.currentTarget.style.boxShadow = `0 10px 25px ${settings.theme?.primaryColor || 'var(--primary-color)'}40`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'linear-gradient(145deg, transparent, transparent)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <span className="relative z-10">{navItem.title}</span>
                                                <div
                                                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    style={{
                                                        background: `linear-gradient(45deg, ${settings.theme?.primaryColor || 'var(--primary-color)'}20, ${settings.theme?.accentColor || 'var(--accent-color)'}20)`
                                                    }}
                                                ></div>
                                            </button>
                                        );
                                    }

                                    return (
                                        <a
                                            key={index}
                                            href={navItem.url}
                                            className="relative text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:text-white hover:-translate-y-1 hover:shadow-lg group overflow-hidden"
                                            style={{
                                                background: 'linear-gradient(145deg, transparent, transparent)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = `linear-gradient(145deg, ${settings.theme?.primaryColor || 'var(--primary-color)'}, ${settings.theme?.accentColor || 'var(--accent-color)'})`;
                                                e.currentTarget.style.boxShadow = `0 10px 25px ${settings.theme?.primaryColor || 'var(--primary-color)'}40`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'linear-gradient(145deg, transparent, transparent)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <span className="relative z-10">{navItem.title}</span>
                                            <div
                                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{
                                                    background: `linear-gradient(45deg, ${settings.theme?.primaryColor || 'var(--primary-color)'}20, ${settings.theme?.accentColor || 'var(--accent-color)'}20)`
                                                }}
                                            ></div>
                                        </a>
                                    );
                                })}

                            {/* Special CTA Button */}
                            <div className="ml-4 pl-4 border-l border-gray-200">
                                <button
                                    className="text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
                                    style={{
                                        background: `linear-gradient(135deg, ${settings.theme?.primaryColor || 'var(--primary-color)'}, ${settings.theme?.accentColor || 'var(--accent-color)'})`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = `0 15px 35px ${settings.theme?.primaryColor || 'var(--primary-color)'}50`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = `0 5px 15px ${settings.theme?.primaryColor || 'var(--primary-color)'}30`;
                                    }}
                                >
                                    <Phone className="inline mr-2" size={16} />
                                    Get Started
                                </button>
                            </div>
                        </nav>
                    )}

                    {/* Mobile Menu Button - Enhanced */}
                    <div className="md:hidden">
                        <button
                            className="p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
                            style={{
                                background: `linear-gradient(135deg, ${settings.theme?.primaryColor || 'var(--primary-color)'}20, ${settings.theme?.accentColor || 'var(--accent-color)'}20)`
                            }}
                        >
                            <div className="w-6 h-6 flex flex-col justify-around">
                                <span
                                    className="block h-0.5 w-6 rounded-full transition-all duration-300"
                                    style={{ backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                ></span>
                                <span
                                    className="block h-0.5 w-6 rounded-full transition-all duration-300"
                                    style={{ backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                ></span>
                                <span
                                    className="block h-0.5 w-6 rounded-full transition-all duration-300"
                                    style={{ backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                ></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
