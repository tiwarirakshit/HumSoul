import { useState, useEffect } from 'react';
import { pushNotificationService } from '../lib/push-notifications';
import { useAuth } from './use-auth';
import { Capacitor } from '@capacitor/core';

export const usePushNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if push notifications are supported
    const supported = Capacitor.isNativePlatform();
    setIsSupported(supported);

    if (supported && user) {
      initializePushNotifications();
    }
  }, [user]);

  const initializePushNotifications = async () => {
    try {
      await pushNotificationService.initialize();
      setIsInitialized(true);
      setPermissionGranted(true);
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      setPermissionGranted(false);
    }
  };

  const removeToken = async () => {
    try {
      await pushNotificationService.removeToken();
    } catch (error) {
      console.error('Failed to remove push notification token:', error);
    }
  };

  return {
    isInitialized,
    permissionGranted,
    isSupported,
    removeToken,
  };
}; 