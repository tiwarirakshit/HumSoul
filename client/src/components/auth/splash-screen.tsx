import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SplashScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoOption, setShowDemoOption] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      // Success is handled by the auth state observer
    } catch (error: any) {
      console.error("Error during sign in", error);
      const errorMessage = error?.message || "Unknown error occurred";
      const errorCode = error?.code || "unknown";
      
      // Handle specific Firebase errors
      if (errorCode === "auth/configuration-not-found") {
        setError(
          "Google Sign-In is not configured correctly. Please make sure Google Sign-In is enabled in your Firebase console and the domain is authorized."
        );
        // Show demo option for easy development
        setShowDemoOption(true);
      } else if (errorCode === "auth/popup-closed-by-user") {
        setError(
          "The sign-in popup was closed before completing authentication. Please try again and complete the sign-in process."
        );
      } else if (errorCode === "auth/popup-blocked") {
        setError(
          "The sign-in popup was blocked by your browser. Please allow popups for this website and try again."
        );
      } else {
        setError(`Sign-in failed: ${errorCode}. Please try again or contact support.`);
      }
      
      toast({
        title: "Sign In Failed",
        description: "There was a problem signing in with Google. Please check the error message below.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // For development only - creates a demo user without requiring Firebase auth
  const handleDemoSignIn = () => {
    try {
      setLoading(true);
      
      // Create a demo user similar to a Firebase user
      const demoUser = {
        uid: 'demo-user-123',
        displayName: 'Demo User',
        email: 'demo@example.com',
        photoURL: 'https://via.placeholder.com/150',
        providerId: 'demo'
      };
      
      // Store in localStorage to persist through page refreshes
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      
      // Reload the page to let auth context pick up the demo user
      window.location.reload();
    } catch (error) {
      console.error('Error setting up demo user:', error);
      setError('Failed to set up demo mode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/50 to-primary/20 p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 rounded-full bg-primary/30 flex items-center justify-center">
            <span className="text-4xl">🎵</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">HumSoul</h1>
          <p className="text-lg text-muted-foreground">
            Transform your mindset with affirmation audio
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              🎧
            </div>
            <p className="text-sm">Listen to guided affirmations</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              🔄
            </div>
            <p className="text-sm">Mix with calming background music</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              ❤️
            </div>
            <p className="text-sm">Save your favorite affirmations</p>
          </div>
        </div>

        {/* Sign In Button */}
        <div className="w-full mt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                {error}
                {error.includes("configuration-not-found") && (
                  <div className="mt-2 text-xs space-y-1">
                    <p className="font-semibold">Please follow these steps to configure Firebase:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Go to your Firebase Console</li>
                      <li>Navigate to Authentication &gt; Sign-in method</li>
                      <li>Enable Google as a sign-in provider</li>
                      <li>Add your app domain to Authorized domains</li>
                      <li>Save the changes and try again</li>
                    </ol>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            className="w-full py-6 text-lg" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>
          
          <p className="mt-4 text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
          
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium">Note:</span> You need to allow pop-ups for this site to sign in with Google.
          </p>
          
          {/* Demo Mode Option */}
          {showDemoOption && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="development-mode" className="text-sm font-medium">
                    Development Mode
                  </Label>
                  <Switch id="development-mode" checked={showDemoOption} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Having trouble with Firebase? Use development mode to explore the app without authentication.
                </p>
                <Button
                  variant="outline"
                  onClick={handleDemoSignIn}
                  disabled={loading}
                  className="w-full"
                >
                  Continue in Demo Mode
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}