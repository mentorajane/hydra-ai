'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashPage() {
  const router = useRouter();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      router.replace('/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="min-h-screen flex items-center justify-center bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-950"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, duration: 1.2 }}
              className="relative mx-auto mb-8"
            >
              <div className="w-32 h-32 mx-auto relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="dropGrad" x1="0%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#53b0ff" />
                      <stop offset="100%" stopColor="#0088d4" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M50 5 C50 5, 85 40, 85 65 C85 85, 70 95, 50 95 C30 95, 15 85, 15 65 C15 40, 50 5, 50 5Z"
                    fill="url(#dropGrad)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                  <motion.path
                    d="M50 45 L50 75"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                  <motion.circle
                    cx="50" cy="40" r="3" fill="rgba(255,255,255,0.8)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  />
                </svg>
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tight mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <span className="text-gradient">Hydra AI</span>
            </motion.h1>

            <motion.p
              className="text-ocean-200 text-lg font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Sua saúde começa com um gole.
            </motion.p>

            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-ocean-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
