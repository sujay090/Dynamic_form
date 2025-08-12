import { Phone } from 'lucide-react';
import { Button } from '../ui/button';
import type { BranchSettings } from '../../API/services/settingsService';

interface CTASectionProps {
    settings: BranchSettings;
}

export const CTASection = ({ settings }: CTASectionProps) => {
    return (
        <section className="py-20 relative overflow-hidden">
            {settings.body?.cta && (settings.body.cta.title || settings.body.cta.description) ? (
                <>
                    {!settings.body.cta.backgroundImage && (
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(to right, ${settings.theme?.primaryColor || 'var(--primary-color)'}, ${settings.theme?.secondaryColor || 'var(--secondary-color)'})`
                            }}
                        ></div>
                    )}
                    {settings.body.cta.backgroundImage && (
                        <>
                            <div className="absolute inset-0" style={{
                                backgroundImage: `url(${settings.body.cta.backgroundImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}></div>
                            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                        </>
                    )}

                    <div className="container mx-auto px-4 text-center relative z-10">
                        {settings.body.cta.title && (
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                {settings.body.cta.title}
                            </h2>
                        )}
                        {settings.body.cta.description && (
                            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
                                {settings.body.cta.description}
                            </p>
                        )}

                        {settings.body.cta.buttonText && (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button
                                    size="lg"
                                    className="text-lg px-12 py-4 text-white font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                    style={{
                                        backgroundColor: settings.theme?.accentColor || 'var(--accent-color)'
                                    }}
                                    onClick={() => {
                                        if (settings.body?.cta?.buttonUrl) {
                                            window.location.href = settings.body.cta.buttonUrl;
                                        }
                                    }}
                                >
                                    {settings.body.cta.buttonText}
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to right, ${settings.theme?.secondaryColor || 'var(--secondary-color)'}, ${settings.theme?.primaryColor || 'var(--primary-color)'})`
                        }}
                    ></div>
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="py-12 bg-white/10 rounded-xl border-2 border-dashed border-white/30">
                            <Phone className="mx-auto mb-4 text-white/60" size={48} />
                            <h3 className="text-2xl font-bold text-white/80 mb-2">Call To Action Section</h3>
                            <p className="text-white/60">This is your CTA section - data will appear here when configured</p>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
};
