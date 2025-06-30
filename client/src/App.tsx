import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import Library from "@/pages/library";
import Record from "@/pages/record";
import Profile from "@/pages/profile";
import Playlist from "@/pages/playlist";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import Personalize from "@/pages/personalize";
import Audio from "@/pages/audio";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useAudio } from "@/hooks/use-audio";
import { useAuth } from "@/hooks/use-auth";
import { useBackgroundMusic } from "@/hooks/use-background-music";
import { ThemeProvider } from "./context/theme-context";
import { AudioProvider } from "./context/audio-context";
import { AuthProvider } from "./context/auth-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { SplashScreen } from "@/components/splash-screen";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Music, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionPopup } from "@/components/subscription/subscription-popup";
import Subscription from "@/pages/subscription";
import AdminMusic from "@/pages/admin/music";
import AdminUsers from "@/pages/admin/users";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminSettings from "@/pages/admin/settings";
import AdminSubscriptions from "@/pages/admin/subscriptions";
import NotificationPreferences from "@/pages/notification-preferences";
import EditProfile from "@/pages/edit-profile";
import { initializeCapacitorPlugins } from '@/lib/capacitor';
import { Capacitor } from '@capacitor/core';
import { NetworkDebug } from "@/components/ui/network-debug";
import { GlobalAudioPlayerProvider } from "@/components/ui/global-audio-player";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

// Protected route wrapper
function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <span className="text-3xl">🎵</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component {...rest} />;
}

// Protected route wrapper with admin check
function AdminRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      setLocation('/');
    }
  }, [user, loading, isAdmin, setLocation]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <span className="text-3xl">🎵</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <Component {...rest} />;
}

// Main router component
function Router() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const pathname = window.location.pathname;
  console.log("Current pathname:", pathname);
  
  // Redirect logic for authenticated users
  useEffect(() => {
    if (!user) return; // Don't redirect if not authenticated
    
    // Redirect from login page if already authenticated
    if (window.location.pathname === '/login') {
      if (isAdmin) {
        setLocation('/admin');
      } else {
        setLocation('/onboarding');
      }
      return;
    }
    
    // Redirect admin users to admin dashboard if they're on non-admin routes
    if (isAdmin && !window.location.pathname.startsWith('/admin')) {
      setLocation('/admin');
      return;
    }
    
    // Redirect regular users to onboarding if they're on admin routes
    if (!isAdmin && window.location.pathname.startsWith('/admin')) {
      setLocation('/onboarding');
      return;
    }
  }, [user, isAdmin, setLocation]);

  return (
    <>
      <Switch>
        {/* Public routes */}
        <Route path="/login">
          {() => {
            if (user) return null;
            return <Login />;
          }}
        </Route>

        {/* Admin routes */}
        <Route path="/admin">
          {() => <AdminRoute component={AdminDashboard} />}
        </Route>
        <Route path="/admin/music">
          {() => <AdminRoute component={AdminMusic} />}
        </Route>
        <Route path="/admin/users">
          {() => <AdminRoute component={AdminUsers} />}
        </Route>
        <Route path="/admin/subscriptions">
          {() => <AdminRoute component={AdminSubscriptions} />}
        </Route>
        <Route path="/admin/settings">
          {() => <AdminRoute component={AdminSettings} />}
        </Route>

        {/* Auth required routes */}
        <Route path="/onboarding">
          {() => <ProtectedRoute component={Onboarding} />}
        </Route>
        <Route path="/personalize">
          {() => <ProtectedRoute component={Personalize} />}
        </Route>
        <Route path="/subscription">
          {() => <ProtectedRoute component={Subscription} />}
        </Route>
        <Route path="/audio">
          {() => <ProtectedRoute component={Audio} />}
        </Route>
        <Route path="/">
          {() => <ProtectedRoute component={Home} />}
        </Route>
        <Route path="/discover">
          {() => <ProtectedRoute component={Discover} />}
        </Route>
        <Route path="/library">
          {() => <ProtectedRoute component={Library} />}
        </Route>
        <Route path="/profile">
          {() => <ProtectedRoute component={Profile} />}
        </Route>
        <Route path="/edit-profile">
          {() => <ProtectedRoute component={EditProfile} />}
        </Route>
        <Route path="/playlist/:id">
          {() => <ProtectedRoute component={Playlist} />}
        </Route>
        <Route path="/record">
          {() => <ProtectedRoute component={Record} />}
        </Route>
        <Route path="/notification-preferences">
          {() => <ProtectedRoute component={NotificationPreferences} />}
        </Route>

        {/* 404 route */}
        <Route>
          {() => <NotFound />}
        </Route>
      </Switch>
      
      {/* Network Debug Component - Only show in development */}
      {import.meta.env.DEV && <NetworkDebug />}
    </>
  );
}

// Main application content
function AppContent() {
  const { currentTrack } = useAudio();
  const { user, isAdmin } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const { isPlaying, play, pause } = useBackgroundMusic();
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Show subscription popup after 3 days of usage
    const subscriptionTimer = setTimeout(() => {
      // Show subscription popup for all users after 3 days
      setShowSubscriptionPopup(true);
    }, 3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds

    return () => {
      clearTimeout(timer);
      clearTimeout(subscriptionTimer);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  // Show only the router content for auth pages
  if (!user || window.location.pathname === '/onboarding') {
    return (
      <main className="h-screen">
        <Router />
      </main>
    );
  }

  // Hide header and bottom nav for admin users or admin routes
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isLoginPage = window.location.pathname === '/login';
  const shouldHideUserUI = isAdmin || isAdminRoute || isLoginPage;

  // Show full app layout for authenticated users
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden relative font-sans">
      {!shouldHideUserUI && <Header />}
      <main className={`flex-1 overflow-y-auto px-4 ${shouldHideUserUI ? '' : 'pb-24'}`}>
        <Router />
      </main>
      {!shouldHideUserUI && <BottomNavigation />}

      {/* Background Music Toggle - Hide for admin users */}
      {!isAdmin && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={() => isPlaying ? pause() : play()}
        >
          {isPlaying ? <Music className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      )}

      {/* Subscription Popup - Hide for admin users */}
      {!isAdmin && (
        <SubscriptionPopup
          isOpen={showSubscriptionPopup}
          onClose={() => setShowSubscriptionPopup(false)}
        />
      )}
    </div>
  );
}

// Root application component
function App() {
  // Initialize native plugins on app start
  useEffect(() => {
    initializeCapacitorPlugins();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AudioProvider>
            <GlobalAudioPlayerProvider>
              <AppContent />
              <Toaster />
            </GlobalAudioPlayerProvider>
          </AudioProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
