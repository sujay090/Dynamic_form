import { BookOpen, Clock, Users, CheckCircle, ChevronRight, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import type { BranchSettings } from '../../API/services/settingsService';

interface ServicesSectionProps {
    settings: BranchSettings;
}

export const ServicesSection = ({ settings }: ServicesSectionProps) => {
    return (
        <section id="services" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                {settings.body?.services?.servicesList && settings.body.services.servicesList.length > 0 ? (
                    <>
                        <div className="text-center mb-16 animate-fadeInUp">
                            <div className="inline-block mb-4">
                                <div
                                    className="w-20 h-0.5 mx-auto rounded-full"
                                    style={{ backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                ></div>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                {settings.body.services.title || "Our Services & Courses"}
                            </h2>
                            {settings.body.services.subtitle && (
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                    {settings.body.services.subtitle}
                                </p>
                            )}
                        </div>

                        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
                            {settings.body.services.servicesList.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 animate-fadeInUp"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Image Section - 70% */}
                                    <div className="relative h-64">
                                        {/* Popular Badge */}
                                        {item.isPopular && item.type === 'course' && (
                                            <div
                                                className="absolute top-4 left-4 z-10 text-white px-3 py-1 rounded-full text-xs font-semibold"
                                                style={{ backgroundColor: settings.theme?.accentColor || 'var(--accent-color)' }}
                                            >
                                                POPULAR
                                            </div>
                                        )}

                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center"
                                                style={{
                                                    backgroundColor: item.type === 'course'
                                                        ? settings.theme?.accentColor || 'var(--accent-color)'
                                                        : settings.theme?.primaryColor || 'var(--primary-color)'
                                                }}
                                            >
                                                <BookOpen className="text-white" size={48} />
                                            </div>
                                        )}

                                        {/* Overlay gradient for better text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                                    </div>

                                    {/* Content Section - 30% */}
                                    <div className="p-6">
                                        {/* Category/Level Badge */}
                                        {(item.category || item.level) && (
                                            <span
                                                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                                                style={{
                                                    backgroundColor: item.type === 'course'
                                                        ? `${settings.theme?.accentColor || 'var(--accent-color)'}20`
                                                        : `${settings.theme?.primaryColor || 'var(--primary-color)'}20`,
                                                    color: item.type === 'course'
                                                        ? settings.theme?.accentColor || 'var(--accent-color)'
                                                        : settings.theme?.primaryColor || 'var(--primary-color)'
                                                }}
                                            >
                                                {item.category || item.level}
                                            </span>
                                        )}

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                            {item.title}
                                        </h3>

                                        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-2">
                                            {item.description}
                                        </p>

                                        {/* Compact Details */}
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex gap-3 text-xs text-gray-500">
                                                {item.duration && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        <span>{item.duration}</span>
                                                    </div>
                                                )}
                                                {item.instructor && (
                                                    <div className="flex items-center gap-1">
                                                        <Users size={12} />
                                                        <span>{item.instructor}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Price */}
                                            {item.price && (
                                                <div
                                                    className="text-white px-3 py-1 rounded-full font-bold text-sm"
                                                    style={{
                                                        backgroundColor: item.type === 'course'
                                                            ? settings.theme?.accentColor || 'var(--accent-color)'
                                                            : settings.theme?.primaryColor || 'var(--primary-color)'
                                                    }}
                                                >
                                                    ₹{item.price}
                                                </div>
                                            )}
                                        </div>

                                        {/* Features - Show only 2 key features */}
                                        {item.features && item.features.length > 0 && (
                                            <div className="mb-4">
                                                <ul className="text-xs text-gray-600 space-y-1">
                                                    {item.features.slice(0, 2).map((feature: string, featureIndex: number) => (
                                                        <li key={featureIndex} className="flex items-center gap-1">
                                                            <CheckCircle
                                                                size={12}
                                                                style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                                            />
                                                            <span className="line-clamp-1">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* CTA Button */}
                                        <button
                                            className="w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg text-sm"
                                            style={{
                                                backgroundColor: item.type === 'course'
                                                    ? settings.theme?.accentColor || 'var(--accent-color)'
                                                    : settings.theme?.primaryColor || 'var(--primary-color)'
                                            }}
                                            onClick={() => {
                                                if (item.enrollmentUrl) {
                                                    window.location.href = item.enrollmentUrl;
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span>{item.type === 'course' ? 'Enroll Now' : 'Learn More'}</span>
                                                <ChevronRight size={14} />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Simple CTA */}
                        <div className="text-center mt-16">
                            <p className="text-gray-600 mb-6 text-lg">
                                Need something specific?
                            </p>
                            <Button
                                size="lg"
                                className="text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)'
                                }}
                            >
                                <Phone className="mr-2" size={18} />
                                Contact Us
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                        <h3 className="text-2xl font-bold text-gray-600 mb-2">Services Section</h3>
                        <p className="text-gray-500">Configure your services and courses in settings</p>
                    </div>
                )}
            </div>
        </section>
    );
};
