import { BookOpen, MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { BranchSettings } from '../../API/services/settingsService';

interface FooterProps {
    settings: BranchSettings;
}

export const Footer = ({ settings }: FooterProps) => {
    return (
        <footer id="contact" className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-4 mb-6">
                                {settings.footer?.companyInfo?.logo ? (
                                    <img
                                        src={settings.footer.companyInfo.logo}
                                        alt="Institute Logo"
                                        className="h-12 w-12 object-contain rounded-lg"
                                    />
                                ) : (
                                    <div
                                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                                        style={{
                                            background: `linear-gradient(to bottom right, ${settings.theme?.primaryColor || 'var(--primary-color)'}, ${settings.theme?.secondaryColor || 'var(--secondary-color)'})`
                                        }}
                                    >
                                        <BookOpen className="text-white" size={24} />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        {settings.footer?.companyInfo?.name || settings.header?.siteName || "Institute"}
                                    </h3>
                                    {settings.header?.tagline && (
                                        <p
                                            className="text-sm"
                                            style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                        >
                                            {settings.header.tagline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {settings.footer?.companyInfo?.description && (
                                <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                                    {settings.footer.companyInfo.description}
                                </p>
                            )}

                            {/* Social Media - Only show if links exist */}
                            {(settings.footer?.socialMedia?.facebook || settings.footer?.socialMedia?.twitter || settings.footer?.socialMedia?.instagram || settings.footer?.socialMedia?.linkedin || settings.footer?.socialMedia?.youtube) && (
                                <div className="flex space-x-4">
                                    {settings.footer.socialMedia.facebook && (
                                        <a
                                            href={settings.footer.socialMedia.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                            style={{
                                                backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)'
                                            }}
                                        >
                                            <span className="text-sm font-bold text-white">f</span>
                                        </a>
                                    )}
                                    {settings.footer.socialMedia.twitter && (
                                        <a
                                            href={settings.footer.socialMedia.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                            style={{
                                                backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)'
                                            }}
                                        >
                                            <span className="text-sm font-bold text-white">t</span>
                                        </a>
                                    )}
                                    {settings.footer.socialMedia.instagram && (
                                        <a
                                            href={settings.footer.socialMedia.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                            style={{
                                                backgroundColor: settings.theme?.accentColor || 'var(--accent-color)'
                                            }}
                                        >
                                            <span className="text-sm font-bold text-white">i</span>
                                        </a>
                                    )}
                                    {settings.footer.socialMedia.linkedin && (
                                        <a
                                            href={settings.footer.socialMedia.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                            style={{
                                                backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)'
                                            }}
                                        >
                                            <span className="text-sm font-bold text-white">in</span>
                                        </a>
                                    )}
                                    {settings.footer.socialMedia.youtube && (
                                        <a
                                            href={settings.footer.socialMedia.youtube}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                            style={{
                                                backgroundColor: settings.theme?.accentColor || 'var(--accent-color)'
                                            }}
                                        >
                                            <span className="text-sm font-bold text-white">yt</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Links - Only show if links exist */}
                        <div>
                            {settings.footer?.quickLinks && settings.footer.quickLinks.length > 0 && (
                                <>
                                    <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
                                    <div className="space-y-3">
                                        {settings.footer.quickLinks.filter(link => link.title)
                                            .sort((a, b) => a.order - b.order)
                                            .map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    className="block text-gray-300 transition-colors"
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = settings.theme?.primaryColor || 'var(--primary-color)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = '';
                                                    }}
                                                >
                                                    {link.title}
                                                </a>
                                            ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="text-xl font-bold mb-6 text-white">Contact Info</h4>
                            <div className="space-y-4">
                                {settings.footer?.contact?.address && (
                                    <div className="flex items-start space-x-3">
                                        <MapPin
                                            size={18}
                                            className="mt-1 flex-shrink-0"
                                            style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                        />
                                        <span className="text-gray-300">{settings.footer.contact.address}</span>
                                    </div>
                                )}
                                {settings.footer?.contact?.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone
                                            size={18}
                                            style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                        />
                                        <span className="text-gray-300">{settings.footer.contact.phone}</span>
                                    </div>
                                )}
                                {settings.footer?.contact?.email && (
                                    <div className="flex items-center space-x-3">
                                        <Mail
                                            size={18}
                                            style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                        />
                                        <span className="text-gray-300">{settings.footer.contact.email}</span>
                                    </div>
                                )}
                                {settings.footer?.contact?.workingHours && (
                                    <div className="flex items-center space-x-3">
                                        <Clock
                                            size={18}
                                            style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                        />
                                        <span className="text-gray-300">{settings.footer.contact.workingHours}</span>
                                    </div>
                                )}

                                {/* Default working hours if not set */}
                                {!settings.footer?.contact?.workingHours && (
                                    <div className="flex items-center space-x-3">
                                        <Clock
                                            size={18}
                                            style={{ color: settings.theme?.primaryColor || 'var(--primary-color)' }}
                                        />
                                        <span className="text-gray-300">Mon - Sat: 9:00 AM - 7:00 PM</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-700 py-6">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-400 mb-4 md:mb-0">
                        © {settings.footer?.copyright?.year || new Date().getFullYear()} {
                            settings.footer?.copyright?.text
                                ? (() => {
                                    try {
                                        // Try to parse JSON string
                                        const parsed = JSON.parse(settings.footer.copyright.text);
                                        return parsed.text || settings.footer?.companyInfo?.name || settings.header?.siteName || "Institute";
                                    } catch {
                                        // If not JSON, use as plain text
                                        return settings.footer.copyright.text;
                                    }
                                })()
                                : `${settings.footer?.companyInfo?.name || settings.header?.siteName || "Institute"}`
                        }. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};
