import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { settingsService, type FooterSettings } from "@/API/services/settingsService";
import { useBranchSelection } from "@/hooks/useBranchSelection";

interface QuickLink {
    title: string;
    url: string;
    order: number;
}

export default function FooterSettings() {
    const { selectedBranch } = useBranchSelection();
    const [isSaving, setIsSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [footerData, setFooterData] = useState<FooterSettings>({
        companyInfo: {
            name: "",
            description: "",
            logo: "",
        },
        contact: {
            address: "",
            phone: "",
            email: "",
            workingHours: "",
        },
        quickLinks: [
            { title: "Privacy Policy", url: "/privacy-policy", order: 1 },
            { title: "Terms of Service", url: "/terms-of-service", order: 2 },
            { title: "Contact Us", url: "/contact", order: 3 },
            { title: "About Us", url: "/about", order: 4 },
        ],
        socialMedia: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            youtube: "",
        },
        copyright: {
            text: "",
            year: new Date().getFullYear(),
        },
    });

    // Remove useEffect and loadFooterSettings as no longer needed

    const handleSave = async () => {
        if (!selectedBranch) {
            toast.error('Please select a branch first');
            return;
        }

        try {
            setIsSaving(true);

            // Validate required fields
            if (!footerData.companyInfo?.name?.trim()) {
                toast.error('Company name is required');
                return;
            }

            await settingsService.updateFooterSettings(selectedBranch._id, footerData, logoFile || undefined);

            toast.success('Footer settings saved successfully!');
            setLogoFile(null); // Reset file input

        } catch (error) {
            console.error('Error saving footer settings:', error);
            toast.error('Failed to save footer settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to initial values
        setFooterData({
            companyInfo: {
                name: "",
                description: "",
                logo: "",
            },
            contact: {
                address: "",
                phone: "",
                email: "",
                workingHours: "",
            },
            quickLinks: [
                { title: "Privacy Policy", url: "/privacy-policy", order: 1 },
                { title: "Terms of Service", url: "/terms-of-service", order: 2 },
                { title: "Contact Us", url: "/contact", order: 3 },
                { title: "About Us", url: "/about", order: 4 },
            ],
            socialMedia: {
                facebook: "",
                twitter: "",
                instagram: "",
                linkedin: "",
                youtube: "",
            },
            copyright: {
                text: "",
                year: new Date().getFullYear(),
            },
        });
        setLogoFile(null);
        toast.info('Changes cancelled');
    };

    // Quick Links management
    const addQuickLink = () => {
        const maxOrder = Math.max(...(footerData.quickLinks?.map(link => link.order) || [0]));
        setFooterData(prev => ({
            ...prev,
            quickLinks: [
                ...(prev.quickLinks || []),
                { title: "", url: "", order: maxOrder + 1 }
            ]
        }));
    };

    const updateQuickLink = (index: number, field: keyof QuickLink, value: string | number) => {
        setFooterData(prev => ({
            ...prev,
            quickLinks: prev.quickLinks?.map((link, i) =>
                i === index ? { ...link, [field]: value } : link
            ) || []
        }));
    };

    const removeQuickLink = (index: number) => {
        setFooterData(prev => ({
            ...prev,
            quickLinks: prev.quickLinks?.filter((_, i) => i !== index) || []
        }));
    };

    if (!selectedBranch) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Please select a branch to manage footer settings</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Footer Settings</h2>
                    <p className="text-muted-foreground">
                        Branch: {selectedBranch.branchName}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>
            <Separator />

            <div className="grid gap-6">
                {/* Company Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                placeholder="Your Company Name"
                                value={footerData.companyInfo?.name || ''}
                                onChange={(e) => setFooterData(prev => ({
                                    ...prev,
                                    companyInfo: {
                                        ...prev.companyInfo,
                                        name: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyDescription">Company Description</Label>
                            <Textarea
                                id="companyDescription"
                                placeholder="Brief description about your company..."
                                rows={3}
                                value={footerData.companyInfo?.description || ''}
                                onChange={(e) => setFooterData(prev => ({
                                    ...prev,
                                    companyInfo: {
                                        ...prev.companyInfo,
                                        description: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyLogo">Company Logo</Label>
                            <Input
                                id="companyLogo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // Validate file size (2MB max)
                                        if (file.size > 2 * 1024 * 1024) {
                                            toast.error('File size should be less than 2MB');
                                            return;
                                        }
                                        setLogoFile(file);
                                        toast.success('Logo selected successfully');
                                    }
                                }}
                            />
                            {footerData.companyInfo?.logo && (
                                <p className="text-sm text-muted-foreground">
                                    Current logo: {footerData.companyInfo.logo}
                                </p>
                            )}
                            {logoFile && (
                                <p className="text-sm text-green-600">
                                    New logo selected: {logoFile.name}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                placeholder="123 Main Street, City, State 12345"
                                rows={2}
                                value={footerData.contact?.address || ''}
                                onChange={(e) => setFooterData(prev => ({
                                    ...prev,
                                    contact: {
                                        ...prev.contact,
                                        address: e.target.value
                                    }
                                }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Email</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    placeholder="info@company.com"
                                    value={footerData.contact?.email || ''}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        contact: {
                                            ...prev.contact,
                                            email: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Phone</Label>
                                <Input
                                    id="contactPhone"
                                    placeholder="+1 (555) 123-4567"
                                    value={footerData.contact?.phone || ''}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        contact: {
                                            ...prev.contact,
                                            phone: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="workingHours">Working Hours</Label>
                            <Input
                                id="workingHours"
                                placeholder="Mon-Fri: 9:00 AM - 6:00 PM"
                                value={footerData.contact?.workingHours || ''}
                                onChange={(e) => setFooterData(prev => ({
                                    ...prev,
                                    contact: {
                                        ...prev.contact,
                                        workingHours: e.target.value
                                    }
                                }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <Input
                                    id="facebook"
                                    placeholder="https://facebook.com/yourpage"
                                    value={footerData.socialMedia?.facebook || ''}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        socialMedia: {
                                            ...prev.socialMedia,
                                            facebook: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter</Label>
                                <Input
                                    id="twitter"
                                    placeholder="https://twitter.com/yourhandle"
                                    value={footerData.socialMedia?.twitter || ''}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        socialMedia: {
                                            ...prev.socialMedia,
                                            twitter: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    placeholder="https://linkedin.com/company/yourcompany"
                                    value={footerData.socialMedia?.linkedin || ''}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        socialMedia: {
                                            ...prev.socialMedia,
                                            linkedin: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                    id="instagram"
                                    placeholder="https://instagram.com/yourhandle"
                                    value={footerData.socialMedia?.instagram || ''}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        socialMedia: {
                                            ...prev.socialMedia,
                                            instagram: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="youtube">YouTube</Label>
                                <Input
                                    id="youtube"
                                    placeholder="https://youtube.com/channel/yourchannel"
                                    value={footerData.socialMedia?.youtube || ''}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        socialMedia: {
                                            ...prev.socialMedia,
                                            youtube: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Quick Links</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addQuickLink}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Link
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {footerData.quickLinks?.map((link, index) => (
                            <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                                <div className="grid grid-cols-3 gap-4 flex-1">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            placeholder="Link title"
                                            value={link.title}
                                            onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL</Label>
                                        <Input
                                            placeholder="/page-url"
                                            value={link.url}
                                            onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            value={link.order}
                                            onChange={(e) => updateQuickLink(index, 'order', parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeQuickLink(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}

                        {(!footerData.quickLinks || footerData.quickLinks.length === 0) && (
                            <p className="text-center text-muted-foreground py-4">
                                No quick links added yet. Click "Add Link" to get started.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Copyright */}
                <Card>
                    <CardHeader>
                        <CardTitle>Copyright Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="copyrightText">Copyright Text</Label>
                                <Input
                                    id="copyrightText"
                                    placeholder="All rights reserved."
                                    value={footerData.copyright?.text || ''}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        copyright: {
                                            ...prev.copyright,
                                            text: e.target.value
                                        }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="copyrightYear">Copyright Year</Label>
                                <Input
                                    id="copyrightYear"
                                    type="number"
                                    placeholder="2024"
                                    value={footerData.copyright?.year || new Date().getFullYear()}
                                    onChange={(e) => setFooterData(prev => ({
                                        ...prev,
                                        copyright: {
                                            ...prev.copyright,
                                            year: parseInt(e.target.value) || new Date().getFullYear()
                                        }
                                    }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
