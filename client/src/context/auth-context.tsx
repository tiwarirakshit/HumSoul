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
  loginWithEmail: (email: string, password: string) => Promise<void>;
  isAdmin: boolean;
};

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isNewUser: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  completeOnboarding: () => {},
  loginWithEmail: async () => {},
  isAdmin: false
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
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkIsAdmin = (userEmail: string | null) => {
    return userEmail === "admin@humsoul.com";
  };

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

  const loginWithEmail = async (email: string, password: string) => {
    // Check if admin is already logged in
    if (user && checkIsAdmin(user.email)) {
      console.log("Admin already logged in, skipping login process");
      return;
    }

    let _email = "admin@humsoul.com";
    let _password = "password";

    if (email === _email && password === _password) {
      // Create a user-like object for admin
      const adminUser = { 
        email: _email,
        uid: 'admin-uid',
        displayName: 'Admin User'
      } as User;
      
      setUser(adminUser);
      setIsAdmin(true);
      setIsNewUser(false);
      localStorage.removeItem('isNewUser');
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      window.location.href = '/admin';
      // Redirect will be handled by useEffect in Login component
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const logout = async () => {
    try {
      if (isAdmin) {
        // Handle admin logout
        localStorage.removeItem('adminUser');
        setIsAdmin(false);
      } else {
        // Handle regular user logout
        await signOutUser();
      }
      
      setUser(null);
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
    // Check for admin user in localStorage first
    const adminUserJson = localStorage.getItem('adminUser');
    if (adminUserJson) {
      try {
        const adminUser = JSON.parse(adminUserJson) as User;
        if (checkIsAdmin(adminUser.email)) {
          setUser(adminUser);
          setIsAdmin(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing admin user:', error);
        localStorage.removeItem('adminUser');
      }
    }

    // Check for demo user in localStorage
    const demoUserJson = localStorage.getItem('demoUser');
    if (demoUserJson) {
      try {
        const demoUser = JSON.parse(demoUserJson) as User;
        setUser(demoUser);
        setIsAdmin(checkIsAdmin(demoUser.email));
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing demo user:', error);
        localStorage.removeItem('demoUser');
      }
    }

    // If no stored user, subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsAdmin(checkIsAdmin(authUser?.email || null));
      
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
    loginWithEmail,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}