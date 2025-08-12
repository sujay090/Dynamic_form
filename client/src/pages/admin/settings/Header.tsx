import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { settingsService, type HeaderSettings } from "@/API/services/settingsService";
import { useBranchSelection } from "@/hooks/useBranchSelection";

interface NavigationItem {
  title: string;
  url: string;
  order: number;
  isActive: boolean;
}

export default function HeaderSettings() {
  const { selectedBranch } = useBranchSelection();
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [headerData, setHeaderData] = useState<HeaderSettings>({
    siteName: "",
    tagline: "",
    logo: "",
    navigation: [
      { title: "Home", url: "/", order: 1, isActive: true },
      { title: "About", url: "/about", order: 2, isActive: true },
      { title: "Services", url: "/services", order: 3, isActive: true },
      { title: "Contact", url: "/contact", order: 4, isActive: true },
    ],
    contactInfo: {
      phone: "",
      email: "",
    },
  });

  // Remove useEffect and loadHeaderSettings as no longer needed

  const handleSave = async () => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      return;
    }

    try {
      setIsSaving(true);
      
      await settingsService.updateHeaderSettings(selectedBranch._id, headerData, logoFile || undefined);
      
      toast.success('Header settings saved successfully!');
      setLogoFile(null); // Reset file input
      
    } catch (error) {
      console.error('Error saving header settings:', error);
      toast.error('Failed to save header settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to initial values
    setHeaderData({
      siteName: "",
      tagline: "",
      logo: "",
      navigation: [
        { title: "Home", url: "/", order: 1, isActive: true },
        { title: "About", url: "/about", order: 2, isActive: true },
        { title: "Services", url: "/services", order: 3, isActive: true },
        { title: "Contact", url: "/contact", order: 4, isActive: true },
      ],
      contactInfo: {
        phone: "",
        email: "",
      },
    });
    setLogoFile(null);
    toast.info('Changes cancelled');
  };

  // Navigation management
  const addNavigationItem = () => {
    const maxOrder = Math.max(...(headerData.navigation?.map(item => item.order) || [0]));
    setHeaderData(prev => ({
      ...prev,
      navigation: [
        ...(prev.navigation || []),
        { title: "", url: "", order: maxOrder + 1, isActive: true }
      ]
    }));
  };

  const updateNavigationItem = (index: number, field: keyof NavigationItem, value: string | number | boolean) => {
    setHeaderData(prev => ({
      ...prev,
      navigation: prev.navigation?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const removeNavigationItem = (index: number) => {
    setHeaderData(prev => ({
      ...prev,
      navigation: prev.navigation?.filter((_, i) => i !== index) || []
    }));
  };

  const moveNavigationItem = (index: number, direction: 'up' | 'down') => {
    if (!headerData.navigation) return;
    
    const newNavigation = [...headerData.navigation];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newNavigation.length) return;
    
    // Swap items
    [newNavigation[index], newNavigation[targetIndex]] = [newNavigation[targetIndex], newNavigation[index]];
    
    // Update order
    newNavigation.forEach((item, i) => {
      item.order = i + 1;
    });
    
    setHeaderData(prev => ({
      ...prev,
      navigation: newNavigation
    }));
  };

  if (!selectedBranch) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please select a branch to manage header settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Header Settings</h2>
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
        {/* Site Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Site Logo & Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name *</Label>
                <Input 
                  id="siteName" 
                  placeholder="Enter site name"
                  value={headerData.siteName || ''}
                  onChange={(e) => setHeaderData(prev => ({
                    ...prev,
                    siteName: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input 
                  id="tagline" 
                  placeholder="Enter site tagline"
                  value={headerData.tagline || ''}
                  onChange={(e) => setHeaderData(prev => ({
                    ...prev,
                    tagline: e.target.value
                  }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Site Logo</Label>
              <Input 
                id="logo" 
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
              {headerData.logo && (
                <p className="text-sm text-muted-foreground">
                  Current logo: {headerData.logo}
                </p>
              )}
              {logoFile && (
                <p className="text-sm text-green-600">
                  New logo selected: {logoFile.name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Recommended: PNG or JPG, max 2MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Navigation Menu</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addNavigationItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {headerData.navigation?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveNavigationItem(index, 'up')}
                      disabled={index === 0}
                      className="h-4 w-4 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveNavigationItem(index, 'down')}
                      disabled={index === (headerData.navigation?.length || 0) - 1}
                      className="h-4 w-4 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Menu title"
                      value={item.title}
                      onChange={(e) => updateNavigationItem(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      placeholder="/page-url"
                      value={item.url}
                      onChange={(e) => updateNavigationItem(index, 'url', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={item.order}
                      onChange={(e) => updateNavigationItem(index, 'order', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={(checked) => updateNavigationItem(index, 'isActive', checked)}
                    />
                    <Label className="text-xs">Active</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeNavigationItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(!headerData.navigation || headerData.navigation.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No navigation items added yet. Click "Add Menu Item" to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Header Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headerPhone">Phone Number</Label>
                <Input 
                  id="headerPhone" 
                  placeholder="+1 (555) 123-4567"
                  value={headerData.contactInfo?.phone || ''}
                  onChange={(e) => setHeaderData(prev => ({
                    ...prev,
                    contactInfo: {
                      ...prev.contactInfo,
                      phone: e.target.value
                    }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headerEmail">Email Address</Label>
                <Input 
                  id="headerEmail" 
                  type="email" 
                  placeholder="contact@example.com"
                  value={headerData.contactInfo?.email || ''}
                  onChange={(e) => setHeaderData(prev => ({
                    ...prev,
                    contactInfo: {
                      ...prev.contactInfo,
                      email: e.target.value
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
