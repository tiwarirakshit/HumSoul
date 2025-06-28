import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Capacitor } from '@capacitor/core';
import { debugApiUrl } from './utils';

// Get the base URL for API requests
const getBaseUrl = (): string => {
  const isNative = Capacitor.isNativePlatform();
  const isDev = import.meta.env.DEV;
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  
  console.log('🔍 Environment Debug:', {
    isNative,
    isDev,
    envUrl,
    userAgent: navigator.userAgent,
    platform: Capacitor.getPlatform()
  });

  // Force production URL for native builds (APK/Android Studio)
  if (isNative) {
    const productionUrl = "https://mpforestvillage.in";
    console.log('📱 Native Platform - FORCING Production URL:', productionUrl);
    return productionUrl;
  }
  
  // For web environment
  const webUrl = envUrl || "https://mpforestvillage.in";
  console.log('🌐 Web Platform - Using URL:', webUrl);
  return webUrl;
};

// Test function to verify API URL configuration
export const testApiUrl = () => {
  const baseUrl = getBaseUrl();
  console.log('🧪 API URL Test:', {
    platform: Capacitor.isNativePlatform() ? 'Native (APK)' : 'Web',
    baseUrl,
    testEndpoint: `${baseUrl}/api/test`,
    environment: import.meta.env.MODE,
    envUrl: import.meta.env.VITE_BACKEND_URL,
    isDev: import.meta.env.DEV,
    isNative: Capacitor.isNativePlatform()
  });
  return baseUrl;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  
  console.log('🚀 API Request:', {
    method,
    url,
    baseUrl,
    fullUrl,
    platform: Capacitor.isNativePlatform() ? 'Native' : 'Web',
    timestamp: new Date().toISOString(),
    data: data ? JSON.stringify(data).substring(0, 200) + '...' : undefined
  });

  const startTime = Date.now();
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✅ API Response:', {
      method,
      url: fullUrl,
      status: res.status,
      statusText: res.statusText,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('❌ API Error:', {
      method,
      url: fullUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

interface QueryOptions {
  on401: UnauthorizedBehavior;
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
}

export const getQueryFn: <T>(options: QueryOptions) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, method = "GET", data, headers = {} }) =>
  async ({ queryKey }) => {
    const baseUrl = getBaseUrl();
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    const requestHeaders: Record<string, string> = {
      ...headers,
      ...(data ? { "Content-Type": "application/json" } : {}),
    };

    const res = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
