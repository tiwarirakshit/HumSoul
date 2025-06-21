import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

export const initializeCapacitorPlugins = () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Initialize Google Auth plugin
      GoogleAuth.initialize({
        clientId: '367237349555-lc4s3ugefef8ufp8mjgh6gu5hcv6uirj.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
        forceCodeForRefreshToken: true,
      });
      console.log('Capacitor Google Auth plugin initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Capacitor Google Auth plugin:', error);
    }
  }
}; 