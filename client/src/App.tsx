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
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      setLocation('/');
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

  if (!user || !user.isAdmin) {
    return null;
  }

  return <Component {...rest} />;
}

// Main router component
function Router() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const pathname = window.location.pathname;
  console.log("Current pathname:", pathname);
  // Redirect from login page if already authenticated
  useEffect(() => {
    if (user && window.location.pathname === '/login') {
      if (user.isAdmin) {
        setLocation('/admin');
      } else {
        setLocation('/onboarding');
      }
    }
  }, [user, setLocation]);

  return (
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
        {() => <ProtectedRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/music">
        {() => <ProtectedRoute component={AdminMusic} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} />}
      </Route>
      <Route path="/admin/subscriptions">
        {() => <ProtectedRoute component={AdminSubscriptions} />}
      </Route>
      <Route path="/admin/settings">
        {() => <ProtectedRoute component={AdminSettings} />}
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
      <Route path="/record">
        {() => <ProtectedRoute component={Record} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/playlist/:id">
        {(params) => <ProtectedRoute component={Playlist} {...params} />}
      </Route>
      <Route path="/notification-preferences" component={NotificationPreferences} />
      <Route path="/edit-profile" component={EditProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Main application content
function AppContent() {
  const { currentTrack } = useAudio();
  const { user } = useAuth();
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
      // Check if user has already subscribed
      if (!user?.isSubscribed) {
        setShowSubscriptionPopup(true);
      }
    }, 3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds

    return () => {
      clearTimeout(timer);
      clearTimeout(subscriptionTimer);
    };
  }, [user?.isSubscribed]);

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

  // Hide bottom nav on /admin routes
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  // Show full app layout for authenticated users
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden relative font-sans">
      {!isAdminRoute && <Header />}
      <main className="flex-1 overflow-y-auto px-4 pb-24">
        <Router />
      </main>
      {!isAdminRoute && <BottomNavigation />}

      {/* Background Music Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full bg-background/80 backdrop-blur-sm"
        onClick={() => isPlaying ? pause() : play()}
      >
        {isPlaying ? <Music className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>

      {/* Subscription Popup */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
      />
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
            <AppContent />
            <Toaster />
          </AudioProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
