"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  User, 
  Shield, 
  Palette, 
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Globe,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { toast } from "sonner"

interface SettingsState {
  appearance: {
    theme: 'light' | 'dark' | 'system'
    compact: boolean
    showAvatars: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'team' | 'private'
    activityTracking: boolean
    dataCollection: boolean
  }
  system: {
    autoSave: boolean
    offlineMode: boolean
    debugMode: boolean
  }
}

export function SettingsView() {
  const [settings, setSettings] = useState<SettingsState>({
    appearance: {
      theme: 'system',
      compact: false,
      showAvatars: true,
    },
    privacy: {
      profileVisibility: 'team',
      activityTracking: true,
      dataCollection: false,
    },
    system: {
      autoSave: true,
      offlineMode: false,
      debugMode: false,
    }
  })

  const [loading, setLoading] = useState(false)

  const updateSettings = (category: keyof SettingsState, key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }
  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // Simulate data export
      const data = {
        exportDate: new Date().toISOString(),
        userSettings: settings,
        // Add more data as needed
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `taskflow-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
        toast.success("Data exported successfully")
    } catch {
      toast.error("Failed to export data")
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion is not implemented in this demo")
    }
  }
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Settings Content */}
      <div className="max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <Settings className="h-8 w-8" />
          <span>Settings</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance & Display</span>
              </CardTitle>
              <CardDescription>
                Customize how TaskFlow looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose your interface theme
                  </p>
                  <Select 
                    value={settings.appearance.theme}
                    onValueChange={(value) => updateSettings('appearance', 'theme', value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4" />
                          <span>System</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact interface layout
                    </p>
                  </div>
                  <Switch
                    checked={settings.appearance.compact}
                    onCheckedChange={(checked) => updateSettings('appearance', 'compact', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Show Avatars</Label>
                    <p className="text-sm text-muted-foreground">
                      Display user avatars throughout the interface
                    </p>
                  </div>
                  <Switch
                    checked={settings.appearance.showAvatars}
                    onCheckedChange={(checked) => updateSettings('appearance', 'showAvatars', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>
                Control your privacy and data usage preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Who can see your profile information
                  </p>
                  <Select 
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => updateSettings('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Public</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="team">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Team Members Only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Private</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Activity Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow tracking of your activity for analytics
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.activityTracking}
                    onCheckedChange={(checked) => updateSettings('privacy', 'activityTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow collection of usage data for improvements
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataCollection}
                    onCheckedChange={(checked) => updateSettings('privacy', 'dataCollection', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure system behavior and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Auto-save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save changes as you work
                    </p>
                  </div>
                  <Switch
                    checked={settings.system.autoSave}
                    onCheckedChange={(checked) => updateSettings('system', 'autoSave', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Offline Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable offline functionality (experimental)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Beta</Badge>
                    <Switch
                      checked={settings.system.offlineMode}
                      onCheckedChange={(checked) => updateSettings('system', 'offlineMode', checked)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Show additional debugging information
                    </p>
                  </div>
                  <Switch
                    checked={settings.system.debugMode}
                    onCheckedChange={(checked) => updateSettings('system', 'debugMode', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-medium">Cache Management</Label>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" size="sm">
                      <Database className="h-4 w-4 mr-2" />
                      Reset Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <div className="space-y-6">
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>
                  Export or import your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Export Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Download all your data in JSON format
                    </p>
                  </div>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Import Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Import data from a backup file
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Delete Account</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button onClick={handleDeleteAccount} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          Save All Settings
        </Button>
      </div>
      </div>
    </div>
  )
}
