import { Phone, Mail } from 'lucide-react';
import type { BranchSettings } from '../../API/services/settingsService';

interface TopBarProps {
    settings: BranchSettings;
}

export const TopBar = ({ settings }: TopBarProps) => {
    if (!settings.header?.contactInfo?.phone && !settings.header?.contactInfo?.email) {
        return null;
    }

    return (
        <div
            className="text-white py-3 px-4"
            style={{ backgroundColor: settings.theme?.primaryColor || 'var(--primary-color)' }}
        >
            <div className="container mx-auto flex justify-between items-center text-sm">
                <div className="flex items-center space-x-6">
                    {settings.header.contactInfo.phone && (
                        <div className="flex items-center space-x-2">
                            <Phone size={16} />
                            <span>{settings.header.contactInfo.phone}</span>
                        </div>
                    )}
                    {settings.header.contactInfo.email && (
                        <div className="flex items-center space-x-2">
                            <Mail size={16} />
                            <span>{settings.header.contactInfo.email}</span>
                        </div>
                    )}
                </div>
                {settings.header?.siteName && (
                    <div className="hidden md:flex items-center">
                        <span className="font-medium">Welcome to {settings.header.siteName}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
