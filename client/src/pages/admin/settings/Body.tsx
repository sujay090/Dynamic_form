import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { settingsService, type BodySettings } from "@/API/services/settingsService";
import { useBranchSelection } from "@/hooks/useBranchSelection";

// ServiceItem interface removed - courses now managed via dedicated Course Management system

interface FeatureItem {
    title: string;
    description: string;
    icon?: string;
}

export default function BodySettings() {
    const { selectedBranch } = useBranchSelection();
    const [isSaving, setIsSaving] = useState(false);
    const [heroBackgroundFiles, setHeroBackgroundFiles] = useState<File[]>([]);
    const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
    const [ctaBackgroundFile, setCtaBackgroundFile] = useState<File | null>(null);
    const [serviceImageFiles, setServiceImageFiles] = useState<{ [key: number]: File }>({});
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

    const [bodyData, setBodyData] = useState<BodySettings>({
        hero: {
            title: "",
            subtitle: "",
            backgroundImages: [], // Changed from backgroundImage to backgroundImages array
            ctaButton: {
                text: "",
                url: "",
                isVisible: true,
            },
        },
        about: {
            title: "",
            description: "",
            image: "",
            features: [],
        },
        // services section removed - courses now managed via dedicated Course Management system
        cta: {
            title: "",
            description: "",
            buttonText: "",
            buttonUrl: "",
            backgroundImage: "",
        },
        contact: {
            title: "",
            description: "",
            isVisible: true,
            showForm: true,
        },
    });

    // Load existing settings on component mount
    useEffect(() => {
        if (selectedBranch) {
            loadBodySettings();
        }
    }, [selectedBranch]);

    const loadBodySettings = async () => {
        try {
            const settings = await settingsService.getPublicSettings(); // Use public API to get current settings
            if (settings.body) {
                setBodyData(settings.body);
            }
        } catch (error) {
            console.error('Error loading body settings:', error);
            toast.error('Failed to load current settings');
        }
    };

    const handleSave = async () => {
        if (!selectedBranch) {
            toast.error('Please select a branch first');
            return;
        }

        try {
            setIsSaving(true);

            const files = {
                heroBackgrounds: heroBackgroundFiles.length > 0 ? heroBackgroundFiles : undefined,
                aboutImage: aboutImageFile || undefined,
                ctaBackground: ctaBackgroundFile || undefined,
                serviceImages: Object.keys(serviceImageFiles).length > 0 ? serviceImageFiles : undefined,
            };

            await settingsService.updateBodySettings(selectedBranch._id, bodyData, files);

            toast.success('Body settings saved successfully!');

            // Reset file inputs
            setHeroBackgroundFiles([]);
            setAboutImageFile(null);
            setCtaBackgroundFile(null);
            setServiceImageFiles({});

        } catch (error) {
            console.error('Error saving body settings:', error);
            toast.error('Failed to save body settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to initial values
        setBodyData({
            hero: {
                title: "",
                subtitle: "",
                backgroundImages: [],
                ctaButton: {
                    text: "",
                    url: "",
                    isVisible: true,
                },
            },
            about: {
                title: "",
                description: "",
                image: "",
                features: [],
            },
            // services section removed - courses now managed via dedicated Course Management system
            cta: {
                title: "",
                description: "",
                buttonText: "",
                buttonUrl: "",
                backgroundImage: "",
            },
            contact: {
                title: "",
                description: "",
                isVisible: true,
                showForm: true,
            },
        });
        setHeroBackgroundFiles([]);
        setAboutImageFile(null);
        setCtaBackgroundFile(null);
        setServiceImageFiles({});
        toast.info('Changes cancelled');
    };

    // Features management
    const addFeature = () => {
        setBodyData(prev => ({
            ...prev,
            about: {
                ...prev.about!,
                features: [
                    ...(prev.about?.features || []),
                    { title: "", description: "", icon: "" }
                ]
            }
        }));
    };

    const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
        setBodyData(prev => ({
            ...prev,
            about: {
                ...prev.about!,
                features: prev.about?.features?.map((feature, i) =>
                    i === index ? { ...feature, [field]: value } : feature
                ) || []
            }
        }));
    };

    const removeFeature = (index: number) => {
        setBodyData(prev => ({
            ...prev,
            about: {
                ...prev.about!,
                features: prev.about?.features?.filter((_, i) => i !== index) || []
            }
        }));
    };



    if (!selectedBranch) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Please select a branch to manage body settings</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Body Content Settings</h2>
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
                {/* Hero Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="heroTitle">Hero Title</Label>
                            <Input
                                id="heroTitle"
                                placeholder="Main headline for hero section"
                                value={bodyData.hero?.title || ''}
                                onChange={(e) => setBodyData(prev => ({
                                    ...prev,
                                    hero: { ...prev.hero!, title: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                            <Textarea
                                id="heroSubtitle"
                                placeholder="Compelling description text for hero section"
                                rows={3}
                                value={bodyData.hero?.subtitle || ''}
                                onChange={(e) => setBodyData(prev => ({
                                    ...prev,
                                    hero: { ...prev.hero!, subtitle: e.target.value }
                                }))}
                            />
                        </div>

                        {/* Hero Background Images Carousel */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Hero Background Images (Carousel)</Label>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="heroImages" className="cursor-pointer">
                                        <Button variant="outline" size="sm" asChild>
                                            <span>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Add Images
                                            </span>
                                        </Button>
                                    </Label>
                                    <Input
                                        id="heroImages"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length > 0) {
                                                // Validate file sizes (2MB max each)
                                                const validFiles = files.filter(file => {
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        toast.error(`File ${file.name} is too large. Max size is 2MB.`);
                                                        return false;
                                                    }
                                                    return true;
                                                });

                                                if (validFiles.length > 0) {
                                                    setHeroBackgroundFiles(prev => [...prev, ...validFiles]);
                                                    toast.success(`${validFiles.length} image(s) added successfully`);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Current Images List */}
                            {heroBackgroundFiles.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {heroBackgroundFiles.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Hero ${index + 1}`}
                                                className="w-full h-24 object-cover rounded border"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    setHeroBackgroundFiles(prev => prev.filter((_, i) => i !== index));
                                                    toast.success('Image removed');
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Live Carousel Preview */}
                            {heroBackgroundFiles.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Live Preview (How it will look on website)</Label>
                                    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                                        <div
                                            className="w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center relative"
                                            style={{
                                                backgroundImage: `url(${URL.createObjectURL(heroBackgroundFiles[currentCarouselIndex])})`
                                            }}
                                        >
                                            {/* Sample overlay content */}
                                            <div className="absolute inset-0 bg-black/40"></div>
                                            <div className="relative z-10 text-center text-white p-6">
                                                <h1 className="text-4xl font-bold mb-4">
                                                    {bodyData.hero?.title || 'Your Hero Title'}
                                                </h1>
                                                <p className="text-lg mb-6">
                                                    {bodyData.hero?.subtitle || 'Your compelling subtitle goes here'}
                                                </p>
                                                {bodyData.hero?.ctaButton?.isVisible && (
                                                    <Button className="bg-white text-black hover:bg-gray-100">
                                                        {bodyData.hero?.ctaButton?.text || 'Get Started'}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Carousel Navigation */}
                                            {heroBackgroundFiles.length > 1 && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                                                        onClick={() => setCurrentCarouselIndex(prev =>
                                                            prev === 0 ? heroBackgroundFiles.length - 1 : prev - 1
                                                        )}
                                                    >
                                                        <ChevronLeft className="h-6 w-6" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                                                        onClick={() => setCurrentCarouselIndex(prev =>
                                                            prev === heroBackgroundFiles.length - 1 ? 0 : prev + 1
                                                        )}
                                                    >
                                                        <ChevronRight className="h-6 w-6" />
                                                    </Button>

                                                    {/* Carousel Dots */}
                                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                                        {heroBackgroundFiles.map((_, index) => (
                                                            <button
                                                                key={index}
                                                                className={`w-2 h-2 rounded-full transition-all ${index === currentCarouselIndex ? 'bg-white' : 'bg-white/50'
                                                                    }`}
                                                                onClick={() => setCurrentCarouselIndex(index)}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        Preview shows how the carousel will appear on your website.
                                        {heroBackgroundFiles.length > 1 && ' Use arrow buttons or dots to navigate between images.'}
                                    </p>
                                </div>
                            )}

                            {/* Existing Images Info */}
                            {bodyData.hero?.backgroundImages && bodyData.hero.backgroundImages.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Current Images on Website</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {bodyData.hero.backgroundImages.map((imageUrl, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={imageUrl}
                                                    alt={`Current Hero ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded border"
                                                />
                                                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                                    Current {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        These images are currently live on your website. Upload new images above to replace them.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* CTA Button */}
                        <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={bodyData.hero?.ctaButton?.isVisible || false}
                                    onCheckedChange={(checked) => setBodyData(prev => ({
                                        ...prev,
                                        hero: {
                                            ...prev.hero!,
                                            ctaButton: { ...prev.hero!.ctaButton!, isVisible: checked }
                                        }
                                    }))}
                                />
                                <Label>Show CTA Button</Label>
                            </div>

                            {bodyData.hero?.ctaButton?.isVisible && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ctaButtonText">CTA Button Text</Label>
                                        <Input
                                            id="ctaButtonText"
                                            placeholder="Get Started"
                                            value={bodyData.hero?.ctaButton?.text || ''}
                                            onChange={(e) => setBodyData(prev => ({
                                                ...prev,
                                                hero: {
                                                    ...prev.hero!,
                                                    ctaButton: { ...prev.hero!.ctaButton!, text: e.target.value }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ctaButtonUrl">CTA Button URL</Label>
                                        <Input
                                            id="ctaButtonUrl"
                                            placeholder="/signup"
                                            value={bodyData.hero?.ctaButton?.url || ''}
                                            onChange={(e) => setBodyData(prev => ({
                                                ...prev,
                                                hero: {
                                                    ...prev.hero!,
                                                    ctaButton: { ...prev.hero!.ctaButton!, url: e.target.value }
                                                }
                                            }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* About Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>About Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="aboutTitle">About Us Title</Label>
                            <Input
                                id="aboutTitle"
                                placeholder="About Us"
                                value={bodyData.about?.title || ''}
                                onChange={(e) => setBodyData(prev => ({
                                    ...prev,
                                    about: { ...prev.about!, title: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aboutDescription">About Us Description</Label>
                            <Textarea
                                id="aboutDescription"
                                placeholder="Write about your organization, mission, and values..."
                                rows={5}
                                value={bodyData.about?.description || ''}
                                onChange={(e) => setBodyData(prev => ({
                                    ...prev,
                                    about: { ...prev.about!, description: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="aboutImage">About Section Image</Label>
                            <Input
                                id="aboutImage"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setAboutImageFile(file);
                                }}
                            />
                            {bodyData.about?.image && (
                                <p className="text-sm text-muted-foreground">
                                    Current: {bodyData.about.image}
                                </p>
                            )}
                            {aboutImageFile && (
                                <p className="text-sm text-green-600">
                                    New image selected: {aboutImageFile.name}
                                </p>
                            )}
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Features</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addFeature}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Feature
                                </Button>
                            </div>

                            {bodyData.about?.features?.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                                    <div className="grid grid-cols-3 gap-4 flex-1">
                                        <Input
                                            placeholder="Feature title"
                                            value={feature.title}
                                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Feature description"
                                            value={feature.description}
                                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Icon name (optional)"
                                            value={feature.icon || ''}
                                            onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeFeature(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>



                {/* Call to Action Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Call to Action Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ctaTitle">CTA Title</Label>
                                <Input
                                    id="ctaTitle"
                                    placeholder="Ready to Start Learning?"
                                    value={bodyData.cta?.title || ''}
                                    onChange={(e) => setBodyData(prev => ({
                                        ...prev,
                                        cta: { ...prev.cta!, title: e.target.value }
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ctaButtonText">CTA Button Text</Label>
                                <Input
                                    id="ctaButtonText"
                                    placeholder="Get Started Today"
                                    value={bodyData.cta?.buttonText || ''}
                                    onChange={(e) => setBodyData(prev => ({
                                        ...prev,
                                        cta: { ...prev.cta!, buttonText: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ctaDescription">CTA Description</Label>
                            <Textarea
                                id="ctaDescription"
                                placeholder="Join thousands of students..."
                                rows={3}
                                value={bodyData.cta?.description || ''}
                                onChange={(e) => setBodyData(prev => ({
                                    ...prev,
                                    cta: { ...prev.cta!, description: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ctaButtonUrl">CTA Button URL</Label>
                            <Input
                                id="ctaButtonUrl"
                                placeholder="/register"
                                value={bodyData.cta?.buttonUrl || ''}
                                onChange={(e) => setBodyData(prev => ({
                                    ...prev,
                                    cta: { ...prev.cta!, buttonUrl: e.target.value }
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ctaBackground">CTA Background Image</Label>
                            <Input
                                id="ctaBackground"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setCtaBackgroundFile(file);
                                }}
                            />
                            {bodyData.cta?.backgroundImage && (
                                <p className="text-sm text-muted-foreground">
                                    Current: {bodyData.cta.backgroundImage}
                                </p>
                            )}
                            {ctaBackgroundFile && (
                                <p className="text-sm text-green-600">
                                    New image selected: {ctaBackgroundFile.name}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Us Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Us Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="contactVisible"
                                checked={bodyData.contact?.isVisible ?? true}
                                onCheckedChange={(checked) => setBodyData(prev => ({
                                    ...prev,
                                    contact: { ...prev.contact!, isVisible: checked }
                                }))}
                            />
                            <Label htmlFor="contactVisible">Show Contact Us Section</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="contactFormVisible"
                                checked={bodyData.contact?.showForm ?? true}
                                onCheckedChange={(checked) => setBodyData(prev => ({
                                    ...prev,
                                    contact: { ...prev.contact!, showForm: checked }
                                }))}
                            />
                            <Label htmlFor="contactFormVisible">Show Contact Form</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactTitle">Contact Section Title</Label>
                                <Input
                                    id="contactTitle"
                                    placeholder="Contact Us"
                                    value={bodyData.contact?.title || ''}
                                    onChange={(e) => setBodyData(prev => ({
                                        ...prev,
                                        contact: { ...prev.contact!, title: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactDescription">Contact Section Description</Label>
                            <Textarea
                                id="contactDescription"
                                placeholder="Get in touch with us to learn more about our courses..."
                                rows={3}
                                value={bodyData.contact?.description || ''}
                                onChange={(e) => setBodyData(prev => ({
                                    ...prev,
                                    contact: { ...prev.contact!, description: e.target.value }
                                }))}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
