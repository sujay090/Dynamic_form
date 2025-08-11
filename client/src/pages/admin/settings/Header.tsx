import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function HeaderSettings() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Header Settings</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
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
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" placeholder="Enter site name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" placeholder="Enter site tagline" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Site Logo</Label>
              <Input id="logo" type="file" accept="image/*" />
              <p className="text-sm text-muted-foreground">
                Recommended: PNG or JPG, max 2MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Menu Items</Label>
              <div className="space-y-2">
                <Input placeholder="Home" />
                <Input placeholder="About" />
                <Input placeholder="Courses" />
                <Input placeholder="Contact" />
              </div>
              <Button variant="outline" size="sm">Add Menu Item</Button>
            </div>
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
                <Input id="headerPhone" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headerEmail">Email Address</Label>
                <Input id="headerEmail" type="email" placeholder="contact@example.com" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
