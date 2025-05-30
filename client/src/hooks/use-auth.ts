import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

/**
 * Custom hook to access the authentication context
 * @returns The authentication context with user and loading state
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}