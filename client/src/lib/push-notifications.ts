import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { auth } from './firebase';

export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

class PushNotificationService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications are only available on native platforms');
      return;
    }

    try {
      // Request permission
      const permissionState = await PushNotifications.requestPermissions();
      
      if (permissionState.receive !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }

      // Register with FCM
      await PushNotifications.register();

      // Set up listeners
      this.setupListeners();

      this.isInitialized = true;
      console.log('Push notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private setupListeners() {
    // Registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      this.saveTokenToServer(token.value);
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration:', error.error);
    });

    // Push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Push notification action clicked
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      this.handleNotificationAction(notification);
    });
  }

  private async saveTokenToServer(token: string) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in, skipping token save');
        return;
      }

      const deviceType = Capacitor.getPlatform();
      
      // Get user ID from Firebase user or make a request to get it
      const response = await fetch('/api/push-notifications/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          deviceType,
          userId: 1, // TODO: Get actual user ID from your auth system
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save token to server');
      }

      console.log('FCM token saved to server successfully');
    } catch (error) {
      console.error('Error saving token to server:', error);
    }
  }

  private handleNotificationReceived(notification: any) {
    // Handle notification received while app is in foreground
    // You can show a custom in-app notification here
    console.log('Notification received in foreground:', notification);
  }

  private handleNotificationAction(notification: any) {
    // Handle when user taps on notification
    const data = notification.notification.data;
    
    if (data?.type === 'playlist') {
      // Navigate to playlist
      window.location.href = `/playlist/${data.playlistId}`;
    } else if (data?.type === 'category') {
      // Navigate to category
      window.location.href = `/discover?category=${data.categoryId}`;
    }
  }

  async removeToken() {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await fetch('/api/push-notifications/token?userId=1', {
        method: 'DELETE',
      });

      console.log('FCM token removed from server');
    } catch (error) {
      console.error('Error removing token from server:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService(); 