import { useState, useEffect } from "react";
import { settingsService, uploadService, authService, type Settings } from "@/lib/api";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { 
  Save, 
  Upload, 
  X, 
  Loader2,
  Settings as SettingsIcon,
  User,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await settingsService.get();
      if (response.data) {
        setSettings(response.data);
        if (response.data.logo) {
          // Cloudinary URLs are already full URLs, local uploads start with /uploads
          setLogoPreview(response.data.logo.startsWith('http') ? response.data.logo : `${import.meta.env.VITE_API_URL}${response.data.logo}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);

      let logoPath = settings.logo;

      if (selectedFile) {
        const uploadResponse = await uploadService.uploadImage(selectedFile);
        if (uploadResponse.success && uploadResponse.data) {
          logoPath = uploadResponse.data.path;
        }
      }

      const updatedSettings = {
        ...settings,
        logo: logoPath,
      };

      await settingsService.update(updatedSettings);
      toast.success("Settings saved successfully");
      setSelectedFile(null);
      fetchSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      await authService.updateProfile({
        name: profileName,
        email: profileEmail,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!settings) return null;

  return (
    <AdminLayout>
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-r from-background via-background to-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                General Settings
              </h1>
              <p className="text-foreground/60 mt-1 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Configure your website settings and business information
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow transition-all hover:-translate-y-0.5">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1">
            <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Account</TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Business</TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Branding</TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Contact</TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Social</TabsTrigger>
            <TabsTrigger value="hours" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Hours</TabsTrigger>
            <TabsTrigger value="website" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Website</TabsTrigger>
            <TabsTrigger value="booking" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">Booking</TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">SEO</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Profile Information */}
            <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profileName">Name</Label>
                  <Input
                    id="profileName"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Email</Label>
                  <Input
                    id="profileEmail"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className="w-full sm:w-auto"
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Business Information */}
        <TabsContent value="business">
          <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Basic information about your catering business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="websiteName">Website Name *</Label>
                <Input
                  id="websiteName"
                  value={settings.websiteName || settings.businessName}
                  onChange={(e) =>
                    setSettings({ ...settings, websiteName: e.target.value })
                  }
                  placeholder="Filipino Catering"
                />
                <p className="text-xs text-muted-foreground">
                  Shown in browser tab and website header
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={settings.businessName}
                  onChange={(e) =>
                    setSettings({ ...settings, businessName: e.target.value })
                  }
                  placeholder="Filipino Catering Co."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={settings.tagline || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, tagline: e.target.value })
                  }
                  placeholder="Authentic Filipino cuisine for your special events"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  placeholder="Tell customers about your business..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Business Logo</Label>
                {logoPreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-24 object-contain rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setLogoPreview("");
                        setSelectedFile(null);
                        setSettings({ ...settings, logo: "" });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedFile ? selectedFile.name : "Choose logo"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: PNG or SVG, max 5MB
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding & Hero Section */}
        <TabsContent value="branding">
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Customize the main banner on your landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={settings.heroTitle || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, heroTitle: e.target.value })
                    }
                    placeholder="Authentic Filipino Catering"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={settings.heroSubtitle || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, heroSubtitle: e.target.value })
                    }
                    placeholder="Bringing the flavors of the Philippines to your special events"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroCtaText">Call-to-Action Button Text</Label>
                  <Input
                    id="heroCtaText"
                    value={settings.heroCtaText || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, heroCtaText: e.target.value })
                    }
                    placeholder="Book Your Event"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>
                  Content for the about section on your landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aboutTitle">About Section Title</Label>
                  <Input
                    id="aboutTitle"
                    value={settings.aboutTitle || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, aboutTitle: e.target.value })
                    }
                    placeholder="About Us"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutContent">About Content</Label>
                  <Textarea
                    id="aboutContent"
                    value={settings.aboutContent || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, aboutContent: e.target.value })
                    }
                    placeholder="Tell your story..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>
                  Customize your website's color scheme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor || "#D97706"}
                        onChange={(e) =>
                          setSettings({ ...settings, primaryColor: e.target.value })
                        }
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.primaryColor || "#D97706"}
                        onChange={(e) =>
                          setSettings({ ...settings, primaryColor: e.target.value })
                        }
                        placeholder="#D97706"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor || "#059669"}
                        onChange={(e) =>
                          setSettings({ ...settings, secondaryColor: e.target.value })
                        }
                        className="w-20 h-10"
                      />
                      <Input
                        value={settings.secondaryColor || "#059669"}
                        onChange={(e) =>
                          setSettings({ ...settings, secondaryColor: e.target.value })
                        }
                        placeholder="#059669"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Information */}
        <TabsContent value="contact">
          <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How customers can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  placeholder="info@filipinocatering.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={settings.notificationEmail || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, notificationEmail: e.target.value })
                  }
                  placeholder="bookings@filipinocatering.com"
                />
                <p className="text-xs text-muted-foreground">
                  Email to receive booking notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={settings.whatsapp || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp: e.target.value })
                  }
                  placeholder="+63 912 345 6789"
                />
                <p className="text-xs text-muted-foreground">
                  For quick customer inquiries
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={settings.address || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  placeholder="123 Main Street, Manila, Philippines"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <Label htmlFor="emailNotifications" className="cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for new bookings
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotificationsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotificationsEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social">
          <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook Page URL</Label>
                <Input
                  id="facebookUrl"
                  type="url"
                  value={settings.facebookUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, facebookUrl: e.target.value })
                  }
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram Profile URL</Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  value={settings.instagramUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, instagramUrl: e.target.value })
                  }
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter/X Profile URL</Label>
                <Input
                  id="twitterUrl"
                  type="url"
                  value={settings.twitterUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, twitterUrl: e.target.value })
                  }
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktokUrl">TikTok Profile URL</Label>
                <Input
                  id="tiktokUrl"
                  type="url"
                  value={settings.tiktokUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, tiktokUrl: e.target.value })
                  }
                  placeholder="https://tiktok.com/@yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube Channel URL</Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  value={settings.youtubeUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, youtubeUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={settings.linkedinUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours">
          <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>
                Set your operating hours for each day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.businessHours && Object.entries(settings.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <Label className="w-28 capitalize">{day}</Label>
                  <Input
                    value={hours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        businessHours: {
                          ...settings.businessHours!,
                          [day]: e.target.value,
                        },
                      })
                    }
                    placeholder="9:00 AM - 6:00 PM"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Settings */}
        <TabsContent value="website">
          <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>
                Configure website behavior and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <Label htmlFor="maintenanceMode" className="cursor-pointer">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the website for maintenance
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <Label htmlFor="allowBookings" className="cursor-pointer">
                    Allow Bookings
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable customer bookings
                  </p>
                </div>
                <Switch
                  id="allowBookings"
                  checked={settings.allowBookings}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowBookings: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    placeholder="PHP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={(e) =>
                      setSettings({ ...settings, currencySymbol: e.target.value })
                    }
                    placeholder="₱"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    placeholder="Asia/Manila"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking">
          <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>
                Configure booking rules and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minGuestsDefault">Default Min Guests</Label>
                  <Input
                    id="minGuestsDefault"
                    type="number"
                    value={settings.minGuestsDefault}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        minGuestsDefault: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxGuestsDefault">Default Max Guests</Label>
                  <Input
                    id="maxGuestsDefault"
                    type="number"
                    value={settings.maxGuestsDefault}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxGuestsDefault: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingLeadTimeDays">Booking Lead Time (Days)</Label>
                <Input
                  id="bookingLeadTimeDays"
                  type="number"
                  value={settings.bookingLeadTimeDays || 7}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bookingLeadTimeDays: parseInt(e.target.value) || 7,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum days in advance customers must book
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={settings.cancellationPolicy || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, cancellationPolicy: e.target.value })
                  }
                  placeholder="Describe your cancellation policy..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  value={settings.termsAndConditions || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, termsAndConditions: e.target.value })
                  }
                  placeholder="Your terms and conditions..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacyPolicy">Privacy Policy</Label>
                <Textarea
                  id="privacyPolicy"
                  value={settings.privacyPolicy || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, privacyPolicy: e.target.value })
                  }
                  placeholder="Your privacy policy..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card className="bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-md border-border/50 shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your website for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.metaTitle || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, metaTitle: e.target.value })
                  }
                  placeholder="Filipino Catering - Authentic Cuisine for Your Events"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.metaDescription || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, metaDescription: e.target.value })
                  }
                  placeholder="Professional Filipino catering services for weddings, corporate events, and special occasions..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 150-160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Textarea
                  id="metaKeywords"
                  value={settings.metaKeywords || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, metaKeywords: e.target.value })
                  }
                  placeholder="filipino catering, wedding catering, corporate catering, manila catering"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated keywords
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
