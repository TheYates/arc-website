"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthHeader from "@/components/auth-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { useAuth, hasPermission } from "@/lib/auth"
import { AuditLogger } from "@/lib/audit-log"
import { Settings, AlertTriangle, CheckCircle, Loader2, Globe, Shield, Bell, Database, Server, Key } from "lucide-react"

interface SystemSettings {
  general: {
    organizationName: string
    organizationEmail: string
    organizationPhone: string
    organizationAddress: string
    website: string
    timezone: string
    dateFormat: string
    currency: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    emergencyAlerts: boolean
    maintenanceNotifications: boolean
  }
  security: {
    passwordMinLength: number
    passwordRequireSpecialChars: boolean
    passwordRequireNumbers: boolean
    passwordRequireUppercase: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    twoFactorRequired: boolean
  }
  integrations: {
    emailProvider: string
    smsProvider: string
    paymentProvider: string
    backupProvider: string
  }
  maintenance: {
    maintenanceMode: boolean
    maintenanceMessage: string
    backupFrequency: string
    logRetentionDays: number
  }
}

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("general")

  // Mock settings data
  const mockSettings: SystemSettings = {
    general: {
      organizationName: "Alpha Rescue Consult",
      organizationEmail: "info@alpharescueconsult.com",
      organizationPhone: "+233 24 123 4567",
      organizationAddress: "123 Liberation Road, East Legon, Accra, Ghana",
      website: "https://alpharescueconsult.com",
      timezone: "GMT",
      dateFormat: "DD/MM/YYYY",
      currency: "GHS",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      emergencyAlerts: true,
      maintenanceNotifications: true,
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      passwordRequireNumbers: true,
      passwordRequireUppercase: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorRequired: false,
    },
    integrations: {
      emailProvider: "SendGrid",
      smsProvider: "Twilio",
      paymentProvider: "Stripe",
      backupProvider: "AWS S3",
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: "System is currently under maintenance. Please check back later.",
      backupFrequency: "daily",
      logRetentionDays: 90,
    },
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
    if (user && !hasPermission(user.role, "admin")) {
      router.push("/dashboard")
    }
    if (user && hasPermission(user.role, "admin")) {
      loadSettings()
    }
  }, [user, authLoading, router])

  const loadSettings = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSettings(mockSettings)
    setIsLoading(false)
  }

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return

    setSettings((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    if (!settings || !user) return

    setIsSaving(true)
    setError("")
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Log the settings update
      await AuditLogger.log(user.id, user.email, "admin.settings.update", "system", {
        updatedBy: user.email,
        timestamp: new Date().toISOString(),
        activeTab,
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Globe },
    { id: "maintenance", label: "Maintenance", icon: Server },
  ]

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading system settings...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasPermission(user.role, "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access system settings.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to load system settings.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-600 mt-2">Configure system-wide settings and preferences</p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                          activeTab === tab.id
                            ? "bg-teal-50 text-teal-700 border-r-2 border-teal-600"
                            : "text-slate-700"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>General Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
                      <Input
                        value={settings.general.organizationName}
                        onChange={(e) => handleSettingChange("general", "organizationName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Organization Email</label>
                      <Input
                        type="email"
                        value={settings.general.organizationEmail}
                        onChange={(e) => handleSettingChange("general", "organizationEmail", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                      <Input
                        value={settings.general.organizationPhone}
                        onChange={(e) => handleSettingChange("general", "organizationPhone", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                      <Input
                        value={settings.general.website}
                        onChange={(e) => handleSettingChange("general", "website", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                    <Textarea
                      value={settings.general.organizationAddress}
                      onChange={(e) => handleSettingChange("general", "organizationAddress", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="GMT">GMT</option>
                        <option value="GMT+1">GMT+1</option>
                        <option value="GMT-5">GMT-5 (EST)</option>
                        <option value="GMT-8">GMT-8 (PST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                      <select
                        value={settings.general.dateFormat}
                        onChange={(e) => handleSettingChange("general", "dateFormat", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) => handleSettingChange("general", "currency", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="GHS">GHS (Ghana Cedi)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (British Pound)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">Email Notifications</h3>
                        <p className="text-sm text-slate-600">Send notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", "emailNotifications", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">SMS Notifications</h3>
                        <p className="text-sm text-slate-600">Send notifications via SMS</p>
                      </div>
                      <Switch
                        checked={settings.notifications.smsNotifications}
                        onCheckedChange={(checked) => handleSettingChange("notifications", "smsNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">Push Notifications</h3>
                        <p className="text-sm text-slate-600">Send browser push notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", "pushNotifications", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">Emergency Alerts</h3>
                        <p className="text-sm text-slate-600">Critical system and patient alerts</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emergencyAlerts}
                        onCheckedChange={(checked) => handleSettingChange("notifications", "emergencyAlerts", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">Maintenance Notifications</h3>
                        <p className="text-sm text-slate-600">System maintenance and update notifications</p>
                      </div>
                      <Switch
                        checked={settings.notifications.maintenanceNotifications}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", "maintenanceNotifications", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Password Length</label>
                      <Input
                        type="number"
                        min="6"
                        max="20"
                        value={settings.security.passwordMinLength}
                        onChange={(e) =>
                          handleSettingChange("security", "passwordMinLength", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                      <Input
                        type="number"
                        min="5"
                        max="480"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          handleSettingChange("security", "sessionTimeout", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Maximum Login Attempts</label>
                    <Input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        handleSettingChange("security", "maxLoginAttempts", Number.parseInt(e.target.value))
                      }
                      className="w-32"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">Password Requirements</h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Require Special Characters</h4>
                        <p className="text-sm text-slate-600">Password must contain special characters (!@#$%^&*)</p>
                      </div>
                      <Switch
                        checked={settings.security.passwordRequireSpecialChars}
                        onCheckedChange={(checked) =>
                          handleSettingChange("security", "passwordRequireSpecialChars", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Require Numbers</h4>
                        <p className="text-sm text-slate-600">Password must contain at least one number</p>
                      </div>
                      <Switch
                        checked={settings.security.passwordRequireNumbers}
                        onCheckedChange={(checked) =>
                          handleSettingChange("security", "passwordRequireNumbers", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Require Uppercase Letters</h4>
                        <p className="text-sm text-slate-600">Password must contain uppercase letters</p>
                      </div>
                      <Switch
                        checked={settings.security.passwordRequireUppercase}
                        onCheckedChange={(checked) =>
                          handleSettingChange("security", "passwordRequireUppercase", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-600">Require 2FA for all users</p>
                      </div>
                      <Switch
                        checked={settings.security.twoFactorRequired}
                        onCheckedChange={(checked) => handleSettingChange("security", "twoFactorRequired", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Integrations Settings */}
            {activeTab === "integrations" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Integration Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Provider</label>
                      <select
                        value={settings.integrations.emailProvider}
                        onChange={(e) => handleSettingChange("integrations", "emailProvider", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="SendGrid">SendGrid</option>
                        <option value="Mailgun">Mailgun</option>
                        <option value="AWS SES">AWS SES</option>
                        <option value="Postmark">Postmark</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMS Provider</label>
                      <select
                        value={settings.integrations.smsProvider}
                        onChange={(e) => handleSettingChange("integrations", "smsProvider", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Twilio">Twilio</option>
                        <option value="AWS SNS">AWS SNS</option>
                        <option value="Vonage">Vonage</option>
                        <option value="MessageBird">MessageBird</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Payment Provider</label>
                      <select
                        value={settings.integrations.paymentProvider}
                        onChange={(e) => handleSettingChange("integrations", "paymentProvider", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Stripe">Stripe</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Square">Square</option>
                        <option value="Flutterwave">Flutterwave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Backup Provider</label>
                      <select
                        value={settings.integrations.backupProvider}
                        onChange={(e) => handleSettingChange("integrations", "backupProvider", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="AWS S3">AWS S3</option>
                        <option value="Google Cloud">Google Cloud Storage</option>
                        <option value="Azure Blob">Azure Blob Storage</option>
                        <option value="Dropbox">Dropbox Business</option>
                      </select>
                    </div>
                  </div>

                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      API keys and credentials are managed separately for security. Contact your system administrator to
                      update integration credentials.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Maintenance Settings */}
            {activeTab === "maintenance" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Maintenance Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900">Maintenance Mode</h3>
                      <p className="text-sm text-slate-600">Enable to prevent user access during maintenance</p>
                    </div>
                    <Switch
                      checked={settings.maintenance.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange("maintenance", "maintenanceMode", checked)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Maintenance Message</label>
                    <Textarea
                      value={settings.maintenance.maintenanceMessage}
                      onChange={(e) => handleSettingChange("maintenance", "maintenanceMessage", e.target.value)}
                      rows={3}
                      placeholder="Message to display to users during maintenance"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Backup Frequency</label>
                      <select
                        value={settings.maintenance.backupFrequency}
                        onChange={(e) => handleSettingChange("maintenance", "backupFrequency", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Log Retention (days)</label>
                      <Input
                        type="number"
                        min="7"
                        max="365"
                        value={settings.maintenance.logRetentionDays}
                        onChange={(e) =>
                          handleSettingChange("maintenance", "logRetentionDays", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" className="bg-transparent">
                      <Database className="h-4 w-4 mr-2" />
                      Run Backup Now
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      <Server className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button variant="outline" onClick={() => loadSettings()} disabled={isSaving} className="bg-transparent">
                Reset Changes
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
