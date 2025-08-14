import api, { publicApi } from "../axiosInstance";
import ENDPOINTS from "../endpoints";

// Types for settings
export interface HeaderSettings {
    siteName?: string;
    tagline?: string;
    logo?: string;
    navigation?: Array<{
        title: string;
        url: string;
        order: number;
        isActive: boolean;
    }>;
    contactInfo?: {
        phone?: string;
        email?: string;
    };
}

export interface BodySettings {
    hero?: {
        title?: string;
        subtitle?: string;
        backgroundImage?: string; // Single background image
        backgroundImages?: string[]; // Multiple background images array
        ctaButton?: {
            text?: string;
            url?: string;
            isVisible?: boolean;
        };
    };
    about?: {
        title?: string;
        description?: string;
        image?: string;
        features?: Array<{
            title: string;
            description: string;
            icon?: string;
        }>;
    };
    services?: {
        title?: string;
        subtitle?: string;
        servicesList?: Array<{
            title: string;
            description: string;
            image?: string;
            price?: string;
            // Additional fields for courses
            duration?: string;
            level?: 'Beginner' | 'Intermediate' | 'Advanced' | '';
            category?: string;
            instructor?: string;
            features?: string[];
            isPopular?: boolean;
            enrollmentUrl?: string;
            type?: 'service' | 'course'; // To distinguish between service and course
        }>;
    };
    cta?: {
        title?: string;
        description?: string;
        buttonText?: string;
        buttonUrl?: string;
        backgroundImage?: string;
    };
    contact?: {
        title?: string;
        description?: string;
        isVisible?: boolean;
        showForm?: boolean;
    };
}

export interface FooterSettings {
    companyInfo?: {
        name?: string;
        description?: string;
        logo?: string;
    };
    contact?: {
        address?: string;
        phone?: string;
        email?: string;
        workingHours?: string;
    };
    quickLinks?: Array<{
        title: string;
        url: string;
        order: number;
    }>;
    socialMedia?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
    };
    copyright?: {
        text?: string;
        year?: number;
    };
}

export interface ThemeSettings {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
}

export interface SEOSettings {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
}

export interface BranchSettings {
    _id?: string;
    branch: string;
    header: HeaderSettings;
    body: BodySettings;
    footer: FooterSettings;
    theme: ThemeSettings;
    seo: SEOSettings;
    isActive?: boolean;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    branchDetails?: {
        _id: string;
        branchName: string;
        code: string;
        address: string;
        phone: string;
    };
}

class SettingsService {
    // Get global settings for public website
    async getPublicSettings(): Promise<BranchSettings> {
        const response = await publicApi.get(`${ENDPOINTS.SETTINGS}/public`);
        return response.data.data;
    }

    // Update header settings
    async updateHeaderSettings(
        branchId: string,
        headerData: HeaderSettings,
        logoFile?: File
    ): Promise<BranchSettings> {
        const formData = new FormData();

        // Add JSON data
        formData.append("siteName", headerData.siteName || "");
        formData.append("tagline", headerData.tagline || "");

        // Add navigation data
        if (headerData.navigation) {
            formData.append("navigation", JSON.stringify(headerData.navigation));
        }

        // Add contact info
        if (headerData.contactInfo) {
            formData.append("contactInfo", JSON.stringify(headerData.contactInfo));
        }

        // Add logo file if provided
        if (logoFile) {
            formData.append("logo", logoFile);
        }

        const response = await api.patch(
            `${ENDPOINTS.SETTINGS}/header`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data.data;
    }

    // Update body settings
    async updateBodySettings(
        branchId: string,
        bodyData: BodySettings,
        files?: {
            heroBackgrounds?: File[]; // Changed to support multiple hero images
            aboutImage?: File;
            ctaBackground?: File;
            serviceImages?: { [key: number]: File }; // Service images by index
        }
    ): Promise<BranchSettings> {
        const formData = new FormData();

        // Add JSON data for each section
        if (bodyData.hero) {
            formData.append("hero", JSON.stringify(bodyData.hero));
        }
        if (bodyData.about) {
            formData.append("about", JSON.stringify(bodyData.about));
        }
        if (bodyData.services) {
            formData.append("services", JSON.stringify(bodyData.services));
        }
        if (bodyData.cta) {
            formData.append("cta", JSON.stringify(bodyData.cta));
        }

        // Add files if provided
        if (files?.heroBackgrounds && files.heroBackgrounds.length > 0) {
            files.heroBackgrounds.forEach(file => {
                formData.append("heroBackgrounds", file);
            });
        }
        if (files?.aboutImage) {
            formData.append("aboutImage", files.aboutImage);
        }
        if (files?.ctaBackground) {
            formData.append("ctaBackground", files.ctaBackground);
        }
        if (files?.serviceImages) {
            Object.entries(files.serviceImages).forEach(([index, file]) => {
                formData.append(`serviceImages[${index}]`, file);
            });
        }

        const response = await api.patch(
            `${ENDPOINTS.SETTINGS}/body`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data.data;
    }

    // Update footer settings
    async updateFooterSettings(
        branchId: string,
        footerData: FooterSettings,
        logoFile?: File
    ): Promise<BranchSettings> {
        const formData = new FormData();

        // Add JSON data for each section
        if (footerData.companyInfo) {
            formData.append("companyInfo", JSON.stringify(footerData.companyInfo));
        }
        if (footerData.contact) {
            formData.append("contact", JSON.stringify(footerData.contact));
        }
        if (footerData.quickLinks) {
            formData.append("quickLinks", JSON.stringify(footerData.quickLinks));
        }
        if (footerData.socialMedia) {
            formData.append("socialMedia", JSON.stringify(footerData.socialMedia));
        }
        if (footerData.copyright) {
            formData.append("copyright", JSON.stringify(footerData.copyright));
        }

        // Add logo file if provided
        if (logoFile) {
            formData.append("logo", logoFile);
        }

        const response = await api.patch(
            `${ENDPOINTS.SETTINGS}/footer`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data.data;
    }

    // Update theme settings
    async updateThemeSettings(
        branchId: string,
        themeData: ThemeSettings
    ): Promise<BranchSettings> {
        const response = await api.patch(
            `${ENDPOINTS.SETTINGS}/theme`,
            themeData
        );
        return response.data.data;
    }

    // Update SEO settings (placeholder - not implemented in backend yet)
    async updateSEOSettings(
        branchId: string,
        seoData: SEOSettings,
        ogImageFile?: File
    ): Promise<BranchSettings> {
        const formData = new FormData();

        formData.append("title", seoData.title || "");
        formData.append("description", seoData.description || "");
        formData.append("keywords", seoData.keywords || "");

        if (ogImageFile) {
            formData.append("ogImage", ogImageFile);
        }

        const response = await api.patch(
            `${ENDPOINTS.SETTINGS}/seo`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data.data;
    }

    // Get all settings (for admin overview)
    async getAllBranchSettings(): Promise<BranchSettings[]> {
        const response = await api.get(`${ENDPOINTS.SETTINGS}/all`);
        return response.data.data;
    }

    // Delete settings
    async deleteSettings(branchId?: string): Promise<BranchSettings> {
        const response = await api.delete(ENDPOINTS.SETTINGS);
        return response.data.data;
    }
}

export const settingsService = new SettingsService();
