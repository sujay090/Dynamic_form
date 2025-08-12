import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Palette, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { settingsService, type ThemeSettings } from "@/API/services/settingsService";
import { useBranchSelection } from "@/hooks/useBranchSelection";

export default function ThemeSettings() {
  const { selectedBranch } = useBranchSelection();
  const [isSaving, setIsSaving] = useState(false);
  
  const [themeData, setThemeData] = useState<ThemeSettings>({
    primaryColor: "#3b82f6", // Blue
    secondaryColor: "#64748b", // Slate
    accentColor: "#10b981", // Emerald
    fontFamily: "Inter",
  });

  // Remove useEffect and loadThemeSettings as no longer needed

  // Predefined color themes
  const colorThemes = [
    {
      name: "Professional Blue",
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      accentColor: "#10b981",
    },
    {
      name: "Modern Purple",
      primaryColor: "#8b5cf6",
      secondaryColor: "#6b7280",
      accentColor: "#f59e0b",
    },
    {
      name: "Corporate Green",
      primaryColor: "#059669",
      secondaryColor: "#374151",
      accentColor: "#dc2626",
    },
    {
      name: "Creative Orange",
      primaryColor: "#ea580c",
      secondaryColor: "#4b5563",
      accentColor: "#7c3aed",
    },
    {
      name: "Elegant Dark",
      primaryColor: "#1f2937",
      secondaryColor: "#6b7280",
      accentColor: "#3b82f6",
    },
  ];

  const fontOptions = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Poppins",
    "Montserrat",
    "Source Sans Pro",
    "Nunito",
    "Raleway",
    "Ubuntu",
  ];

  const handleSave = async () => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      return;
    }

    try {
      setIsSaving(true);
      
      await settingsService.updateThemeSettings(selectedBranch._id, themeData);
      
      toast.success('Theme settings saved successfully!');
      
    } catch (error) {
      console.error('Error saving theme settings:', error);
      toast.error('Failed to save theme settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to default theme
    setThemeData({
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      accentColor: "#10b981",
      fontFamily: "Inter",
    });
    toast.info('Changes cancelled');
  };

  const applyColorTheme = (theme: typeof colorThemes[0]) => {
    setThemeData(prev => ({
      ...prev,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
    }));
    toast.success(`Applied ${theme.name} theme`);
  };

  const resetToDefault = () => {
    setThemeData({
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      accentColor: "#10b981",
      fontFamily: "Inter",
    });
    toast.success('Reset to default theme');
  };

  if (!selectedBranch) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please select a branch to manage theme settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Theme Settings</h2>
          <p className="text-muted-foreground">
            Branch: {selectedBranch.branchName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={resetToDefault}
            disabled={isSaving}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
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
        {/* Quick Theme Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Quick Theme Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose from pre-designed color combinations
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colorThemes.map((theme, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => applyColorTheme(theme)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex space-x-1">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.primaryColor }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.secondaryColor }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.accentColor }}
                      ></div>
                    </div>
                    <span className="font-medium text-sm">{theme.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyColorTheme(theme);
                    }}
                  >
                    Apply Theme
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-3">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={themeData.primaryColor || '#3b82f6'}
                    onChange={(e) => setThemeData(prev => ({
                      ...prev,
                      primaryColor: e.target.value
                    }))}
                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={themeData.primaryColor || '#3b82f6'}
                    onChange={(e) => setThemeData(prev => ({
                      ...prev,
                      primaryColor: e.target.value
                    }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for buttons, links, and main UI elements
                </p>
              </div>

              {/* Secondary Color */}
              <div className="space-y-3">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={themeData.secondaryColor || '#64748b'}
                    onChange={(e) => setThemeData(prev => ({
                      ...prev,
                      secondaryColor: e.target.value
                    }))}
                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={themeData.secondaryColor || '#64748b'}
                    onChange={(e) => setThemeData(prev => ({
                      ...prev,
                      secondaryColor: e.target.value
                    }))}
                    placeholder="#64748b"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for secondary text and subtle elements
                </p>
              </div>

              {/* Accent Color */}
              <div className="space-y-3">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="accentColor"
                    type="color"
                    value={themeData.accentColor || '#10b981'}
                    onChange={(e) => setThemeData(prev => ({
                      ...prev,
                      accentColor: e.target.value
                    }))}
                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={themeData.accentColor || '#10b981'}
                    onChange={(e) => setThemeData(prev => ({
                      ...prev,
                      accentColor: e.target.value
                    }))}
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for highlights, success states, and special elements
                </p>
              </div>
            </div>

            {/* Color Preview */}
            <div className="space-y-3">
              <Label>Color Preview</Label>
              <div className="p-6 border rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button 
                      style={{ backgroundColor: themeData.primaryColor }}
                      className="text-white"
                    >
                      Primary Button
                    </Button>
                    <Button 
                      variant="outline"
                      style={{ 
                        borderColor: themeData.secondaryColor,
                        color: themeData.secondaryColor 
                      }}
                    >
                      Secondary Button
                    </Button>
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: themeData.accentColor }}
                    >
                      Accent Badge
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p style={{ color: themeData.primaryColor }} className="font-semibold">
                      Primary text color example
                    </p>
                    <p style={{ color: themeData.secondaryColor }}>
                      Secondary text color example
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <select
                id="fontFamily"
                value={themeData.fontFamily || 'Inter'}
                onChange={(e) => setThemeData(prev => ({
                  ...prev,
                  fontFamily: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {fontOptions.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">
                Choose the primary font family for your website
              </p>
            </div>

            {/* Font Preview */}
            <div className="space-y-3">
              <Label>Font Preview</Label>
              <div className="p-6 border rounded-lg bg-muted/50">
                <div 
                  className="space-y-3"
                  style={{ fontFamily: themeData.fontFamily }}
                >
                  <h1 className="text-3xl font-bold">Heading 1 Sample</h1>
                  <h2 className="text-2xl font-semibold">Heading 2 Sample</h2>
                  <h3 className="text-xl font-medium">Heading 3 Sample</h3>
                  <p className="text-base">
                    This is a paragraph text sample showing how the selected font family will appear on your website. 
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Small text and descriptions will appear like this.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Theme Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Dark Mode Support</p>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic dark mode detection
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Custom CSS</p>
                  <p className="text-sm text-muted-foreground">
                    Add custom CSS rules for advanced styling
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Animation Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Configure page transitions and animations
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
