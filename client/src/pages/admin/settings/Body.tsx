import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function BodySettings() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Body Content Settings</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
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
              <Input id="heroTitle" placeholder="Main headline for hero section" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroDescription">Hero Description</Label>
              <Textarea 
                id="heroDescription" 
                placeholder="Compelling description text for hero section"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Background Image</Label>
              <Input id="heroImage" type="file" accept="image/*" />
              <p className="text-sm text-muted-foreground">
                Recommended: High resolution image, 1920x1080px
              </p>
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
              <Input id="aboutTitle" placeholder="About Us" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutText">About Us Content</Label>
              <Textarea 
                id="aboutText" 
                placeholder="Write about your organization, mission, and values..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle>Services/Features Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="servicesTitle">Services Title</Label>
              <Input id="servicesTitle" placeholder="Our Services" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredCourses">Featured Courses Count</Label>
              <Input 
                id="featuredCourses" 
                type="number" 
                placeholder="6" 
                min="1" 
                max="12"
              />
              <p className="text-sm text-muted-foreground">
                Number of featured courses to display on homepage
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardHeader>
            <CardTitle>Call to Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaTitle">CTA Title</Label>
                <Input id="ctaTitle" placeholder="Ready to Start Learning?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaButton">CTA Button Text</Label>
                <Input id="ctaButton" placeholder="Get Started Today" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
