'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardData {
  total_ml: number;
  meta_ml: number;
  percentual: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ total_ml: 0, meta_ml: 2600, percentual: 0 });
  const [animating, setAnimating] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [userName, setUserName] = useState('Jane');

  useEffect(() => {
    loadData();
    const user = localStorage.getItem('userName');
    if (user) setUserName(user);
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/v1/hydration/hoje', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch {}
  };

  const handleDrink = async () => {
    setAnimating(true);
    setShowWater(true);
    setTimeout(() => setShowWater(false), 1200);

    const token = localStorage.getItem('token');
    if (token) {
      const meta = await fetch('http://localhost:3001/api/v1/goals/atual', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const metaData = await meta.json();
      const gole = metaData?.quantidade_por_gole_ml || 200;

      await fetch('http://localhost:3001/api/v1/hydration/registrar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade_ml: gole }),
      });
      loadData();
    }

    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => setAnimating(false), 500);
  };

  const percent = Math.min(data.percentual, 100);
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-950 overflow-hidden">
      <AnimatePresence>
        {showWater && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <div className="w-full h-full water-fill flex items-center justify-center">
              <motion.div
                initial={{ scale: 3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-8xl"
              >
                💧
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-ocean-300 text-sm">Olá</p>
          <h1 className="text-3xl font-bold text-white">{userName}</h1>
        </motion.div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative w-72 h-72">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
              <circle
                cx="140" cy="140" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="12"
              />
              <motion.circle
                cx="140" cy="140" r={radius}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#53b0ff" />
                  <stop offset="100%" stopColor="#0088d4" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-5xl font-bold text-white"
                key={data.total_ml}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
              >
                {(data.total_ml / 1000).toFixed(1)}
              </motion.span>
              <span className="text-ocean-300 text-lg font-light">L</span>
              <span className="text-ocean-400 text-sm mt-1">
                Meta {data.meta_ml > 0 ? (data.meta_ml / 1000).toFixed(1) : '—'} L
              </span>
            </div>
          </div>

          <motion.p
            className="text-ocean-300 text-sm mt-4"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {percent < 30
              ? 'Você ainda bebeu pouco hoje'
              : percent < 70
              ? 'Bom progresso! Continue assim'
              : 'Quase lá! Vai conseguir!'}
          </motion.p>
        </div>

        <motion.button
          onClick={handleDrink}
          disabled={animating}
          whileTap={{ scale: 0.92 }}
          className="w-32 h-32 mx-auto flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 text-white text-lg font-bold shadow-2xl shadow-ocean-500/30 active:shadow-lg transition-shadow mb-8"
        >
          <motion.span
            animate={animating ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
            className="text-4xl mb-1"
          >
            💧
          </motion.span>
          <span className="text-sm">Bebi Água</span>
        </motion.button>

        <div className="grid grid-cols-2 gap-3">
          <QuickStat icon="⚡" label="Hoje" value={`${data.total_ml}ml`} />
          <QuickStat icon="🎯" label="Meta" value={`${data.meta_ml}ml`} />
          <QuickStat icon="📊" label="Progresso" value={`${Math.round(percent)}%`} />
          <QuickStat icon="🏆" label="Sequência" value="3 dias" />
        </div>
      </div>
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="text-ocean-300 text-xs mt-1">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  );
}
