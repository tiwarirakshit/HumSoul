import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
          className="relative w-32 h-32 mx-auto mb-6"
        >
          {/* Logo Container */}
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src="/images/Logo.jpg"
            alt="HumSoul Logo"
            className="w-full h-full object-cover rounded-full shadow-lg"
          />
        </motion.div>

        {/* Text Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1.2,
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <h1 className="text-4xl font-bold tracking-wide bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent" style={{ fontFamily: "'Inter', sans-serif" }}>
            HumSoul
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-2"
          >
            Your daily dose of positivity
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
} 