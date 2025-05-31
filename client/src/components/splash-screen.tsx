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
          <motion.div
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            {/* Individual feathers */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.15,
                  duration: 0.5,
                  ease: "easeOut"
                }}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                  transformOrigin: "center center"
                }}
              >
                <div 
                  className="w-8 h-12 rounded-full"
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
              </motion.div>
            ))}
          </motion.div>

          {/* Center Glow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0) 70%)',
              filter: 'blur(8px)'
            }}
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