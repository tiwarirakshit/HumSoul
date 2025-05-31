import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Save, RefreshCw, Trash2, Lock, Globe, Mail, BellRing } from "lucide-react";
import AdminLayout from "./layout";

export default function AdminSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    appName: "HumSoul",
    appDescription: "Affirmations and guided meditation app",
    supportEmail: "support@humsoul.com",
    defaultLanguage: "en",
    defaultTheme: "system",
    maintenanceMode: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enablePushNotifications: true,
    notifyNewUsers: true,
    notifyNewSubscriptions: true,
    notifyCancelledSubscriptions: true,
    dailyReportEmail: "admin@humsoul.com"
  });

  const [securitySettings, setSecuritySettings] = useState({
    allowNewRegistrations: true,
    requireEmailVerification: true,
    twofactorForAdmins: true,
    sessionTimeout: "60",
    passwordMinLength: "8",
    passwordRequireSpecialChars: true
  });

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving general settings:", generalSettings);
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving notification settings:", notificationSettings);
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving security settings:", securitySettings);
  };

  const clearCache = () => {
    console.log("Clearing application cache");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleGeneralSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name</Label>
                    <Input 
                      id="appName" 
                      value={generalSettings.appName}
                      onChange={(e) => setGeneralSettings({...generalSettings, appName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appDescription">Application Description</Label>
                    <Textarea 
                      id="appDescription" 
                      value={generalSettings.appDescription}
                      onChange={(e) => setGeneralSettings({...generalSettings, appDescription: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input 
                        id="supportEmail" 
                        type="email" 
                        value={generalSettings.supportEmail}
                        onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultLanguage">Default Language</Label>
                      <Select 
                        value={generalSettings.defaultLanguage}
                        onValueChange={(value) => setGeneralSettings({...generalSettings, defaultLanguage: value})}
                      >
                        <SelectTrigger id="defaultLanguage">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultTheme">Default Theme</Label>
                    <Select
                      value={generalSettings.defaultTheme}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, defaultTheme: value})}
                    >
                      <SelectTrigger id="defaultTheme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenanceMode: checked})}
                    />
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification preferences for the application
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleNotificationSubmit}>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableEmailNotifications"
                      checked={notificationSettings.enableEmailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, enableEmailNotifications: checked})}
                    />
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enablePushNotifications"
                      checked={notificationSettings.enablePushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, enablePushNotifications: checked})}
                    />
                    <Label htmlFor="enablePushNotifications">Enable Push Notifications</Label>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Admin Notifications</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifyNewUsers"
                        checked={notificationSettings.notifyNewUsers}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notifyNewUsers: checked})}
                      />
                      <Label htmlFor="notifyNewUsers">Notify on New User Registration</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifyNewSubscriptions"
                        checked={notificationSettings.notifyNewSubscriptions}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notifyNewSubscriptions: checked})}
                      />
                      <Label htmlFor="notifyNewSubscriptions">Notify on New Subscriptions</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifyCancelledSubscriptions"
                        checked={notificationSettings.notifyCancelledSubscriptions}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notifyCancelledSubscriptions: checked})}
                      />
                      <Label htmlFor="notifyCancelledSubscriptions">Notify on Cancelled Subscriptions</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dailyReportEmail">Daily Report Email</Label>
                    <Input 
                      id="dailyReportEmail" 
                      type="email" 
                      value={notificationSettings.dailyReportEmail}
                      onChange={(e) => setNotificationSettings({...notificationSettings, dailyReportEmail: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    <BellRing className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security settings for the application
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSecuritySubmit}>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowNewRegistrations"
                      checked={securitySettings.allowNewRegistrations}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, allowNewRegistrations: checked})}
                    />
                    <Label htmlFor="allowNewRegistrations">Allow New User Registrations</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireEmailVerification"
                      checked={securitySettings.requireEmailVerification}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireEmailVerification: checked})}
                    />
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="twofactorForAdmins"
                      checked={securitySettings.twofactorForAdmins}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twofactorForAdmins: checked})}
                    />
                    <Label htmlFor="twofactorForAdmins">Require 2FA for Admin Users</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input 
                        id="sessionTimeout" 
                        type="number" 
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <Input 
                        id="passwordMinLength" 
                        type="number" 
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordRequireSpecialChars"
                      checked={securitySettings.passwordRequireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireSpecialChars: checked})}
                    />
                    <Label htmlFor="passwordRequireSpecialChars">Require Special Characters in Passwords</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    <Lock className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>
                  System maintenance tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Cache Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear application cache to resolve potential issues or refresh data.
                  </p>
                  <Button variant="outline" onClick={clearCache}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Cache
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Database Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a backup of the application database.
                  </p>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Create Backup
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium">System Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>App Version:</div>
                    <div>1.0.0</div>
                    <div>Database Version:</div>
                    <div>PostgreSQL 14.5</div>
                    <div>Environment:</div>
                    <div>Production</div>
                    <div>Last Update:</div>
                    <div>2024-03-20</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 