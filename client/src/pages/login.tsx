import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Login() {
  const { loginWithGoogle, user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect based on user state
  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/onboarding";
    }
  }, [user, loading, setLocation]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // The redirect will be handled by the useEffect above
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  // Don't render login page if already authenticated
  if (user) {
    return null;
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
                      background: `linear-gradient(135deg, ${
                        i % 2 === 0 
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
          {/* Login Button */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-14 relative overflow-hidden group bg-white dark:bg-black"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-3">
              <FcGoogle className="w-6 h-6" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Continue with Google
              </span>
            </div>
          </Button>

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