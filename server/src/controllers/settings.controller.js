import { Settings } from "../models/settings.model.js";
import { ApiError } from "../utils/apiArror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get public settings (no authentication required)
export const getPublicSettings = asyncHandler(async (req, res) => {
    // Get global settings for public display
    let settings = await Settings.findOne({});

    if (!settings) {
        // Return default settings if none exist
        return res
            .status(200)
            .json(new ApiResponse(200, {
                header: {
                    siteName: "Your Website",
                    tagline: "Your Tagline",
                    navigation: [
                        { title: "Home", url: "/", order: 1, isActive: true },
                        { title: "About", url: "/about", order: 2, isActive: true },
                        { title: "Contact", url: "/contact", order: 3, isActive: true }
                    ]
                },
                body: {
                    hero: {
                        title: "Welcome to Our Website",
                        subtitle: "Your trusted partner for quality services",
                        backgroundImages: []
                    }
                },
                footer: {
                    companyInfo: {
                        name: "Your Company"
                    },
                    copyright: {
                        text: "All rights reserved.",
                        year: new Date().getFullYear()
                    }
                },
                theme: {
                    primaryColor: "#3b82f6",
                    secondaryColor: "#64748b",
                    accentColor: "#10b981",
                    fontFamily: "Inter"
                }
            }, "Default settings"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, settings, "Public settings retrieved successfully"));
});

// Get global settings
export const getSettings = asyncHandler(async (req, res) => {
    // Get or create global settings
    let settings = await Settings.findOne({});

    if (!settings) {
        settings = await Settings.create({
            updatedBy: req.user._id,
            header: {
                siteName: "Your Website",
                tagline: "Your Tagline",
            },
            footer: {
                companyInfo: {
                    name: "Your Company",
                },
                copyright: {
                    text: "All rights reserved.",
                    year: new Date().getFullYear()
                }
            }
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, settings, "Settings retrieved successfully"));
});

// Update header settings
export const updateHeaderSettings = asyncHandler(async (req, res) => {
    const headerData = req.body;

    // Parse JSON strings from FormData
    if (headerData.navigation && typeof headerData.navigation === 'string') {
        try {
            headerData.navigation = JSON.parse(headerData.navigation);
        } catch (error) {
            console.error('Error parsing navigation JSON:', error);
            headerData.navigation = [];
        }
    }

    if (headerData.contactInfo && typeof headerData.contactInfo === 'string') {
        try {
            headerData.contactInfo = JSON.parse(headerData.contactInfo);
        } catch (error) {
            console.error('Error parsing contactInfo JSON:', error);
            headerData.contactInfo = {};
        }
    }

    // Handle file upload for logo
    let logoUrl = headerData.logo;
    if (req.file) {
        logoUrl = `${req.protocol}://${req.get("host")}/assets/${req.file.filename}`;
    }

    // Update or create global settings
    const settings = await Settings.findOneAndUpdate(
        {},
        {
            $set: {
                header: {
                    ...headerData,
                    logo: logoUrl,
                },
                updatedBy: req.user._id,
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, settings, "Header settings updated successfully"));
});

// Update body settings
export const updateBodySettings = asyncHandler(async (req, res) => {
    const bodyData = req.body;

    // Parse JSON strings from FormData
    if (bodyData.hero && typeof bodyData.hero === 'string') {
        try {
            bodyData.hero = JSON.parse(bodyData.hero);
        } catch (error) {
            console.error('Error parsing hero JSON:', error);
            bodyData.hero = {};
        }
    }

    if (bodyData.about && typeof bodyData.about === 'string') {
        try {
            bodyData.about = JSON.parse(bodyData.about);
        } catch (error) {
            console.error('Error parsing about JSON:', error);
            bodyData.about = {};
        }
    }

    if (bodyData.services && typeof bodyData.services === 'string') {
        try {
            bodyData.services = JSON.parse(bodyData.services);
        } catch (error) {
            console.error('Error parsing services JSON:', error);
            bodyData.services = {};
        }
    }

    if (bodyData.cta && typeof bodyData.cta === 'string') {
        try {
            bodyData.cta = JSON.parse(bodyData.cta);
        } catch (error) {
            console.error('Error parsing cta JSON:', error);
            bodyData.cta = {};
        }
    }

    // Handle file uploads for hero background, about image, service images, etc.
    const files = req.files || [];

    // Convert files array to object for easier processing
    const filesByFieldName = {};
    if (Array.isArray(files)) {
        files.forEach(file => {
            if (!filesByFieldName[file.fieldname]) {
                filesByFieldName[file.fieldname] = [];
            }
            filesByFieldName[file.fieldname].push(file);
        });
    } else {
        // If files is already an object (from upload.fields)
        Object.assign(filesByFieldName, files);
    }

    // Process multiple hero background images
    if (filesByFieldName.heroBackgrounds && filesByFieldName.heroBackgrounds.length > 0) {
        bodyData.hero = bodyData.hero || {};
        bodyData.hero.backgroundImages = filesByFieldName.heroBackgrounds.map(file =>
            `${req.protocol}://${req.get("host")}/assets/${file.filename}`
        );
    }

    // Process about section image
    if (filesByFieldName.aboutImage && filesByFieldName.aboutImage[0]) {
        bodyData.about = bodyData.about || {};
        bodyData.about.image = `${req.protocol}://${req.get("host")}/assets/${filesByFieldName.aboutImage[0].filename}`;
    }

    // Process CTA background image
    if (filesByFieldName.ctaBackground && filesByFieldName.ctaBackground[0]) {
        bodyData.cta = bodyData.cta || {};
        bodyData.cta.backgroundImage = `${req.protocol}://${req.get("host")}/assets/${filesByFieldName.ctaBackground[0].filename}`;
    }

    // Process service images (can be used for both services and courses)
    if (bodyData.services && bodyData.services.servicesList && Array.isArray(bodyData.services.servicesList)) {
        bodyData.services.servicesList.forEach((service, index) => {
            // Check for both possible field name formats
            const serviceImageField1 = `serviceImages[${index}]`;
            const serviceImageField2 = `serviceImage_${index}`;

            if (filesByFieldName[serviceImageField1] && filesByFieldName[serviceImageField1][0]) {
                service.image = `${req.protocol}://${req.get("host")}/assets/${filesByFieldName[serviceImageField1][0].filename}`;
            } else if (filesByFieldName[serviceImageField2] && filesByFieldName[serviceImageField2][0]) {
                service.image = `${req.protocol}://${req.get("host")}/assets/${filesByFieldName[serviceImageField2][0].filename}`;
            }
        });
    }

    // Update global settings
    const settings = await Settings.findOneAndUpdate(
        {},
        {
            $set: {
                body: bodyData,
                updatedBy: req.user._id,
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, settings, "Body settings updated successfully"));
});

// Update footer settings
export const updateFooterSettings = asyncHandler(async (req, res) => {
    const footerData = req.body;

    // Parse JSON strings from FormData
    if (footerData.quickLinks && typeof footerData.quickLinks === 'string') {
        try {
            footerData.quickLinks = JSON.parse(footerData.quickLinks);
        } catch (error) {
            console.error('Error parsing quickLinks JSON:', error);
            footerData.quickLinks = [];
        }
    }

    if (footerData.socialMedia && typeof footerData.socialMedia === 'string') {
        try {
            footerData.socialMedia = JSON.parse(footerData.socialMedia);
        } catch (error) {
            console.error('Error parsing socialMedia JSON:', error);
            footerData.socialMedia = {};
        }
    }

    if (footerData.companyInfo && typeof footerData.companyInfo === 'string') {
        try {
            footerData.companyInfo = JSON.parse(footerData.companyInfo);
        } catch (error) {
            console.error('Error parsing companyInfo JSON:', error);
            footerData.companyInfo = {};
        }
    }

    if (footerData.contact && typeof footerData.contact === 'string') {
        try {
            footerData.contact = JSON.parse(footerData.contact);
        } catch (error) {
            console.error('Error parsing contact JSON:', error);
            footerData.contact = {};
        }
    }

    // Handle copyright field conversion from string to object
    if (footerData.copyright && typeof footerData.copyright === 'string') {
        footerData.copyright = {
            text: footerData.copyright,
            year: new Date().getFullYear()
        };
    }

    // Handle logo file upload
    let logoUrl = footerData.companyInfo?.logo;
    if (req.file) {
        logoUrl = `${req.protocol}://${req.get("host")}/assets/${req.file.filename}`;
        footerData.companyInfo = footerData.companyInfo || {};
        footerData.companyInfo.logo = logoUrl;
    }

    // Update global settings
    const settings = await Settings.findOneAndUpdate(
        {},
        {
            $set: {
                footer: footerData,
                updatedBy: req.user._id,
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, settings, "Footer settings updated successfully"));
});

// Update theme settings
export const updateThemeSettings = asyncHandler(async (req, res) => {
    const themeData = req.body;

    // Update global settings
    const settings = await Settings.findOneAndUpdate(
        {},
        {
            $set: {
                theme: themeData,
                updatedBy: req.user._id,
            },
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, settings, "Theme settings updated successfully"));
});

// Get all settings (for admin overview)
export const getAllSettings = asyncHandler(async (req, res) => {
    const settings = await Settings.find({ isActive: true })
        .populate('updatedBy', 'name email')
        .sort({ updatedAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, settings, "All settings retrieved successfully"));
});

// Delete settings
export const deleteSettings = asyncHandler(async (req, res) => {
    const settings = await Settings.findOneAndUpdate(
        {},
        { isActive: false, updatedBy: req.user._id },
        { new: true }
    );

    if (!settings) {
        throw new ApiError(404, "Settings not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, settings, "Settings deleted successfully"));
});
