import { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "firebase/auth";
import { onAuthStateChange, signInWithGoogle, signOutUser } from "@/lib/firebase";

// Define AuthContext type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isNewUser: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
};

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isNewUser: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  completeOnboarding: () => {},
});

// Auth Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create Auth Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      // Check if this is the user's first sign in
      if (result?.user?.metadata.creationTime === result?.user?.metadata.lastSignInTime) {
        setIsNewUser(true);
        localStorage.setItem('isNewUser', 'true');
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setIsNewUser(false);
      localStorage.removeItem('isNewUser');
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const completeOnboarding = () => {
    setIsNewUser(false);
    localStorage.removeItem('isNewUser');
  };

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUserJson = localStorage.getItem('demoUser');
    if (demoUserJson) {
      try {
        const demoUser = JSON.parse(demoUserJson) as User;
        setUser(demoUser);
        setLoading(false);
        return () => {}; // No cleanup needed for demo mode
      } catch (error) {
        console.error('Error parsing demo user:', error);
        // If demo user is invalid, remove it and continue with normal auth
        localStorage.removeItem('demoUser');
      }
    }

    // If no demo user, subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      if (authUser && localStorage.getItem('isNewUser') === 'true') {
        setIsNewUser(true);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Context provider value
  const value = {
    user,
    loading,
    isNewUser,
    loginWithGoogle,
    logout,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}