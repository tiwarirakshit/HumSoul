import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Personalize() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);

  const handleComplete = () => {
    // Save personalization settings
    // You would typically make an API call here
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Personalize Your Experience</h1>
          <p className="text-muted-foreground">
            Make HumSoul yours by customizing these settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we call you?"
            />
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <Label htmlFor="theme">App Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new meditations
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          {/* Daily Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reminders">Daily Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Remind me to meditate daily
              </p>
            </div>
            <Switch
              id="reminders"
              checked={reminders}
              onCheckedChange={setReminders}
            />
          </div>
        </div>

        <Button onClick={handleComplete} className="w-full">
          Complete Setup
        </Button>
      </div>
    </div>
  );
} 