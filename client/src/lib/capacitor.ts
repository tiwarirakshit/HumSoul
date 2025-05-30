import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

export const initializeCapacitorPlugins = () => {
  if (Capacitor.isNativePlatform()) {
    // Initialize Google Auth plugin
    GoogleAuth.initialize({
      clientId: '367237349555-lc4s3ugefef8ufp8mjgh6gu5hcv6uirj.apps.googleusercontent.com', // Replace with your web client ID from Google Cloud Console
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }
}; 