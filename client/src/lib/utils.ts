import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Capacitor } from '@capacitor/core'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Debug utility for API URLs
export const debugApiUrl = () => {
  const isNative = Capacitor.isNativePlatform();
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  const fallbackUrl = "https://mpforestvillage.in";
  
  console.log('🔍 API URL Debug Info:', {
    isNativePlatform: isNative,
    environmentUrl: envUrl,
    fallbackUrl: fallbackUrl,
    finalUrl: isNative ? fallbackUrl : (envUrl || fallbackUrl)
  });
  
  return isNative ? fallbackUrl : (envUrl || fallbackUrl);
};
