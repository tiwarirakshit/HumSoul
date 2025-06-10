import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { FcGoogle, FcVoicemail } from "react-icons/fc";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { loginWithGoogle, logout, user, loading, loginWithEmail, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Redirect based on user state
  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    // If admin is already logged in, redirect to admin
    if (user && isAdmin) {
      window.location.href = "/admin";
      return;
    }

    // If regular user is logged in, redirect to onboarding
    if (user && !isAdmin) {
      window.location.href = "/onboarding";
      return;
    }
  }, [user, loading, isAdmin, setLocation]);

  const handleGoogleLogin = async () => {
    // Don't allow Google login if admin is already logged in
    if (user && isAdmin) {
      console.log("Admin already logged in");
      return;
    }

    try {
      await loginWithGoogle();
      // The redirect will be handled by the useEffect above
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const handleEmailLogin = async () => {
    // Don't show email form if admin is already logged in
    if (user && isAdmin) {
      console.log("Admin already logged in");
      return;
    }
    setShowEmailForm(true);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Don't allow email login if admin is already logged in
    if (user && isAdmin) {
      console.log("Admin already logged in");
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      await loginWithEmail(formData.email, formData.password);
      // The redirect will be handled by the useEffect above
    } catch (error) {
      console.error("Email login failed:", error);
      setLoginError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login page if already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isAdmin ? "Redirecting to admin panel..." : "Redirecting..."}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Logo Container */}
            <div className="absolute inset-0">
              {/* Individual feathers */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-30px)`,
                    transformOrigin: "center center"
                  }}
                >
                  <div
                    className="w-6 h-10 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${i % 2 === 0
                          ? '#8B5CF6 0%, #6366F1 100%'
                          : '#60A5FA 0%, #3B82F6 100%'
                        })`,
                      opacity: 0.9,
                      transform: 'rotate(45deg)',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
                    }}
                  />
                </div>
              ))}
            </div>
            {/* Center Glow Effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0) 70%)',
                filter: 'blur(8px)'
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold tracking-wide bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent mb-2">
              Welcome to HumSoul
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your journey to inner peace begins here
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-6"
        >
          {!showEmailForm ? (
            <>
              {/* Google Login Button */}
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-14 relative overflow-hidden group bg-white dark:bg-black"
                disabled={user && isAdmin}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <FcGoogle className="w-6 h-6" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Continue with Google
                  </span>
                </div>
              </Button>

              {/* Admin Email Login Button */}
              <Button
                onClick={handleEmailLogin}
                variant="outline"
                className="w-full h-14 relative overflow-hidden group bg-white dark:bg-black"
                disabled={user && isAdmin}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <FcVoicemail className="w-6 h-6" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Login with Admin Email and Password
                  </span>
                </div>
              </Button>
            </>
          ) : (
            /* Email/Password Form */
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Admin Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your admin email"
                  className="h-12 bg-white dark:bg-black border-gray-300 dark:border-gray-600"
                  required
                  disabled={user && isAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="h-12 bg-white dark:bg-black border-gray-300 dark:border-gray-600 pr-12"
                    required
                    disabled={user && isAdmin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={user && isAdmin}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                >
                  {loginError}
                </motion.div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loginLoading || (user && isAdmin)}
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white"
                >
                  {loginLoading ? "Signing in..." : "Sign In"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full text-gray-600 dark:text-gray-400"
                  disabled={user && isAdmin}
                >
                  Back to other options
                </Button>
              </div>
            </motion.form>
          )}

          {/* Terms Text */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 px-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>

      {/* Background Gradient Effect */}
      <div
        className="fixed inset-0 -z-10 opacity-30 dark:opacity-20"
        style={{
          background: 'radial-gradient(circle at top right, rgba(139,92,246,0.1), transparent 70%), radial-gradient(circle at bottom left, rgba(96,165,250,0.1), transparent 70%)'
        }}
      />
    </div>
  );
}