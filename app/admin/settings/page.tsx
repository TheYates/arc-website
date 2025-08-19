"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import {
  Settings,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  Users,
  Bell,
  Shield,
} from "lucide-react";

interface AdminSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  isEditable: boolean;
}

interface SettingsByCategory {
  [category: string]: AdminSetting[];
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsByCategory>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: string }>({});
  
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        router.push("/");
        return;
      }
      fetchSettings();
    }
  }, [user, authLoading, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin-settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      
      // Group settings by category
      const grouped = data.settings.reduce((acc: SettingsByCategory, setting: AdminSetting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
      }, {});
      
      setSettings(grouped);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      const settingsToUpdate = Object.entries(pendingChanges).map(([key, value]) => ({
        key,
        value,
      }));

      const response = await fetch("/api/admin-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: settingsToUpdate }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      // Update local state
      setSettings(prev => {
        const updated = { ...prev };
        Object.entries(pendingChanges).forEach(([key, value]) => {
          Object.keys(updated).forEach(category => {
            const settingIndex = updated[category].findIndex(s => s.key === key);
            if (settingIndex !== -1) {
              updated[category][settingIndex].value = value;
            }
          });
        });
        return updated;
      });

      setPendingChanges({});
      setHasChanges(false);
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingInput = (setting: AdminSetting) => {
    const currentValue = pendingChanges[setting.key] ?? setting.value;
    
    if (!setting.isEditable) {
      return (
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
          {setting.value} (Read-only)
        </div>
      );
    }

    // Boolean settings
    if (setting.value === "true" || setting.value === "false") {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={currentValue === "true"}
            onCheckedChange={(checked) => 
              handleSettingChange(setting.key, checked ? "true" : "false")
            }
          />
          <Label className="text-sm">
            {currentValue === "true" ? "Enabled" : "Disabled"}
          </Label>
        </div>
      );
    }

    // Numeric settings
    if (!isNaN(Number(setting.value))) {
      return (
        <Input
          type="number"
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          min="0"
        />
      );
    }

    // Text settings
    if (setting.description && setting.description.length > 100) {
      return (
        <Textarea
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.key, e.target.value)}
          rows={3}
        />
      );
    }

    return (
      <Input
        value={currentValue}
        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
      />
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "service_requests":
        return <Clock className="h-5 w-5" />;
      case "scheduling":
        return <Settings className="h-5 w-5" />;
      case "notifications":
        return <Bell className="h-5 w-5" />;
      case "permissions":
        return <Shield className="h-5 w-5" />;
      case "users":
        return <Users className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    return category
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="text-muted-foreground">
            Access denied. Administrator role required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">
              Configure service request and scheduling system behavior
            </p>
          </div>
          {hasChanges && (
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue={Object.keys(settings)[0]} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {Object.keys(settings).map((category) => (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <span className="hidden sm:inline">{getCategoryTitle(category)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(settings).map(([category, categorySettings]) => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-6">
                {categorySettings.map((setting) => (
                  <Card key={setting.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {getCategoryTitle(setting.key.replace(`${category}_`, ""))}
                          </CardTitle>
                          {setting.description && (
                            <CardDescription className="mt-1">
                              {setting.description}
                            </CardDescription>
                          )}
                        </div>
                        {pendingChanges[setting.key] && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {renderSettingInput(setting)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {hasChanges && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    You have unsaved changes
                  </p>
                  <p className="text-sm text-orange-700">
                    Don't forget to save your changes before leaving this page.
                  </p>
                </div>
                <Button onClick={handleSaveSettings} disabled={isSaving} size="sm">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
