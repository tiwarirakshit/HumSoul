import { useLocation } from "wouter";
import { ChevronLeft, Bell, BellOff, Mail, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function NotificationPreferences() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    newContent: true,
    meditationReminders: true,
    emailUpdates: false,
    pushNotifications: true,
    inAppMessages: true
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4 px-4 py-4" style={{
          background:"white"
        }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/profile')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Notification Preferences</h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-24 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Daily Reminders */}
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Daily Reminders</h3>
                  <p className="text-sm text-muted-foreground">Get reminded to meditate daily</p>
                </div>
              </div>
              <Switch
                checked={notifications.dailyReminders}
                onCheckedChange={() => toggleNotification('dailyReminders')}
              />
            </div>
          </div>

          {/* New Content */}
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">New Content</h3>
                  <p className="text-sm text-muted-foreground">Get notified about new meditations</p>
                </div>
              </div>
              <Switch
                checked={notifications.newContent}
                onCheckedChange={() => toggleNotification('newContent')}
              />
            </div>
          </div>

          {/* Meditation Reminders */}
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BellOff className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Meditation Reminders</h3>
                  <p className="text-sm text-muted-foreground">Reminders to take breaks and meditate</p>
                </div>
              </div>
              <Switch
                checked={notifications.meditationReminders}
                onCheckedChange={() => toggleNotification('meditationReminders')}
              />
            </div>
          </div>

          {/* Email Updates */}
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Email Updates</h3>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={notifications.emailUpdates}
                onCheckedChange={() => toggleNotification('emailUpdates')}
              />
            </div>
          </div>

          {/* Push Notifications */}
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={() => toggleNotification('pushNotifications')}
              />
            </div>
          </div>

          {/* In-App Messages */}
          <div className="bg-card rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">In-App Messages</h3>
                  <p className="text-sm text-muted-foreground">Receive messages within the app</p>
                </div>
              </div>
              <Switch
                checked={notifications.inAppMessages}
                onCheckedChange={() => toggleNotification('inAppMessages')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 