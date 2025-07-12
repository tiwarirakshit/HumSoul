import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';

interface NotificationForm {
  title: string;
  body: string;
  type: 'all' | 'specific';
  userId?: string;
  data?: {
    type?: string;
    playlistId?: string;
    categoryId?: string;
  };
}

export default function NotificationsPage() {
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    body: '',
    type: 'all',
    userId: '',
    data: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = form.type === 'all' 
        ? '/api/push-notifications/send-all'
        : `/api/push-notifications/send/${form.userId}`;

      const payload = {
        title: form.title,
        body: form.body,
        data: form.data,
        adminUserId: 1, // TODO: Get actual admin user ID
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: `Notification sent successfully! Sent: ${result.sent}, Failed: ${result.failed}`,
      });

      // Reset form
      setForm({
        title: '',
        body: '',
        type: 'all',
        userId: '',
        data: {},
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Push Notifications</h1>
        <p className="text-muted-foreground">
          Send push notifications to your users
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
            <CardDescription>
              Send a push notification to all users or a specific user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value: 'all' | 'specific') =>
                      setForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="specific">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.type === 'specific' && (
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      type="number"
                      placeholder="Enter user ID"
                      value={form.userId}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, userId: e.target.value }))
                      }
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Notification title"
                  value={form.title}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  placeholder="Notification message"
                  value={form.body}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, body: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataType">Action Type (Optional)</Label>
                <Select
                  value={form.data?.type || ''}
                  onValueChange={(value) =>
                    setForm(prev => ({
                      ...prev,
                      data: { ...prev.data, type: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No action</SelectItem>
                    <SelectItem value="playlist">Open Playlist</SelectItem>
                    <SelectItem value="category">Open Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.data?.type === 'playlist' && (
                <div className="space-y-2">
                  <Label htmlFor="playlistId">Playlist ID</Label>
                  <Input
                    id="playlistId"
                    type="number"
                    placeholder="Enter playlist ID"
                    value={form.data?.playlistId || ''}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        data: { ...prev.data, playlistId: e.target.value },
                      }))
                    }
                  />
                </div>
              )}

              {form.data?.type === 'category' && (
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category ID</Label>
                  <Input
                    id="categoryId"
                    type="number"
                    placeholder="Enter category ID"
                    value={form.data?.categoryId || ''}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        data: { ...prev.data, categoryId: e.target.value },
                      }))
                    }
                  />
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Sending...' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Pre-configured notification templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  setForm({
                    title: 'New Playlist Available!',
                    body: 'Check out our latest affirmations playlist',
                    type: 'all',
                    data: { type: 'playlist' },
                  })
                }
              >
                New Playlist Template
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setForm({
                    title: 'Daily Motivation',
                    body: 'Time for your daily dose of positive affirmations',
                    type: 'all',
                    data: {},
                  })
                }
              >
                Daily Motivation Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 