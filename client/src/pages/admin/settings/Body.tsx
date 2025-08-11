import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { settingsService, type BodySettings } from "@/API/services/settingsService";
import { useBranchSelection } from "@/hooks/useBranchSelection";

interface ServiceItem {
  title: string;
  description: string;
  image?: string;
  price?: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export default function BodySettings() {
  const { selectedBranch } = useBranchSelection();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [heroBackgroundFile, setHeroBackgroundFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [ctaBackgroundFile, setCtaBackgroundFile] = useState<File | null>(null);
  
  const [bodyData, setBodyData] = useState<BodySettings>({
    hero: {
      title: "",
      subtitle: "",
      backgroundImage: "",
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
    services: {
      title: "",
      subtitle: "",
      servicesList: [],
    },
    cta: {
      title: "",
      description: "",
      buttonText: "",
      buttonUrl: "",
      backgroundImage: "",
    },
  });

  // Load existing settings on component mount
  useEffect(() => {
    if (selectedBranch) {
      loadBodySettings();
    }
  }, [selectedBranch]);

  const loadBodySettings = async () => {
    if (!selectedBranch) return;
    
    try {
      setIsLoading(true);
      const settings = await settingsService.getBranchSettings(selectedBranch._id);
      
      if (settings.body) {
        setBodyData(settings.body);
      }
    } catch (error) {
      console.error('Error loading body settings:', error);
      toast.error('Failed to load body settings');
    } finally {
      setIsLoading(false);
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
        heroBackground: heroBackgroundFile || undefined,
        aboutImage: aboutImageFile || undefined,
        ctaBackground: ctaBackgroundFile || undefined,
      };

      await settingsService.updateBodySettings(selectedBranch._id, bodyData, files);
      
      toast.success('Body settings saved successfully!');
      
      // Reset file inputs
      setHeroBackgroundFile(null);
      setAboutImageFile(null);
      setCtaBackgroundFile(null);
      
    } catch (error) {
      console.error('Error saving body settings:', error);
      toast.error('Failed to save body settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    loadBodySettings(); // Reset to original values
    setHeroBackgroundFile(null);
    setAboutImageFile(null);
    setCtaBackgroundFile(null);
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

  // Services management
  const addService = () => {
    setBodyData(prev => ({
      ...prev,
      services: {
        ...prev.services!,
        servicesList: [
          ...(prev.services?.servicesList || []),
          { title: "", description: "", image: "", price: "" }
        ]
      }
    }));
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    setBodyData(prev => ({
      ...prev,
      services: {
        ...prev.services!,
        servicesList: prev.services?.servicesList?.map((service, i) => 
          i === index ? { ...service, [field]: value } : service
        ) || []
      }
    }));
  };

  const removeService = (index: number) => {
    setBodyData(prev => ({
      ...prev,
      services: {
        ...prev.services!,
        servicesList: prev.services?.servicesList?.filter((_, i) => i !== index) || []
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

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
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
          <CardContent className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Background Image</Label>
              <Input 
                id="heroImage" 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setHeroBackgroundFile(file);
                }}
              />
              {bodyData.hero?.backgroundImage && (
                <p className="text-sm text-muted-foreground">
                  Current: {bodyData.hero.backgroundImage}
                </p>
              )}
              {heroBackgroundFile && (
                <p className="text-sm text-green-600">
                  New image selected: {heroBackgroundFile.name}
                </p>
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

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle>Services/Courses Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servicesTitle">Services Title</Label>
                <Input 
                  id="servicesTitle" 
                  placeholder="Our Services"
                  value={bodyData.services?.title || ''}
                  onChange={(e) => setBodyData(prev => ({
                    ...prev,
                    services: { ...prev.services!, title: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servicesSubtitle">Services Subtitle</Label>
                <Input 
                  id="servicesSubtitle" 
                  placeholder="What we offer"
                  value={bodyData.services?.subtitle || ''}
                  onChange={(e) => setBodyData(prev => ({
                    ...prev,
                    services: { ...prev.services!, subtitle: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            {/* Services List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Services List</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addService}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>
              
              {bodyData.services?.servicesList?.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Service {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeService(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Service Title</Label>
                      <Input
                        placeholder="Service name"
                        value={service.title}
                        onChange={(e) => updateService(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (optional)</Label>
                      <Input
                        placeholder="₹99"
                        value={service.price || ''}
                        onChange={(e) => updateService(index, 'price', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Description</Label>
                    <Textarea
                      placeholder="Service description"
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
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
      </div>
    </div>
  );
}
