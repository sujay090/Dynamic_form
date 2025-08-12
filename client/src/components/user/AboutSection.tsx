import { Users, CheckCircle } from 'lucide-react';
import type { BranchSettings } from '../../API/services/settingsService';

interface AboutSectionProps {
    settings: BranchSettings;
}

export const AboutSection = ({ settings }: AboutSectionProps) => {
    return (
        <section id="about" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                {settings.body?.about && (settings.body.about.title || settings.body.about.description || settings.body.about.image) ? (
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            {settings.body.about.title && (
                                <>
                                    <span
                                        className="font-semibold text-lg"
                                        style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                    >
                                        About Our Institute
                                    </span>
                                    <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-6">
                                        {settings.body.about.title}
                                    </h2>
                                </>
                            )}
                            {settings.body.about.description && (
                                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                    {settings.body.about.description}
                                </p>
                            )}

                            {settings.body.about.features && settings.body.about.features.length > 0 && (
                                <div className="space-y-4 mb-8">
                                    {settings.body.about.features.map((feature, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <CheckCircle
                                                className="mt-1 flex-shrink-0"
                                                size={20}
                                                style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                            />
                                            <span className="text-gray-700 font-medium">
                                                {typeof feature === 'string' ? feature : feature.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="order-1 lg:order-2">
                            {settings.body.about.image && (
                                <div className="relative">
                                    <img
                                        src={settings.body.about.image}
                                        alt="About Institute"
                                        className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                                    />
                                    <div
                                        className="absolute inset-0 rounded-2xl"
                                        style={{
                                            background: `linear-gradient(to top, ${settings.theme?.primaryColor || 'var(--primary-color)'}20, transparent)`
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <Users className="mx-auto mb-4 text-gray-400" size={48} />
                        <h3 className="text-2xl font-bold text-gray-600 mb-2">About Section</h3>
                        <p className="text-gray-500">This is your About section - data will appear here when configured</p>
                    </div>
                )}
            </div>
        </section>
    );
};
