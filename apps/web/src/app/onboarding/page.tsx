'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    title: 'Você esquece de beber água?',
    subtitle: 'Você não está sozinho. 75% das pessoas não bebem a quantidade ideal de água todos os dias.',
    icon: (
      <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
        <path d="M50 5 C50 5, 85 40, 85 65 C85 85, 70 95, 50 95 C30 95, 15 85, 15 65 C15 40, 50 5, 50 5Z" fill="rgba(83, 176, 255, 0.3)" stroke="#53b0ff" strokeWidth="2" />
        <text x="50" y="60" textAnchor="middle" fill="#53b0ff" fontSize="14">?</text>
      </svg>
    ),
  },
  {
    title: 'Hidratação muda tudo',
    subtitle: 'Melhora sua disposição, memória, concentração e até o humor. Seu corpo funciona melhor com água.',
    icon: (
      <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#53b0ff" strokeWidth="2" />
        <path d="M35 50 L48 63 L68 38" fill="none" stroke="#53b0ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Meta personalizada para você',
    subtitle: 'Com base no seu peso, idade, clima, atividade física e condições de saúde. Sem achismos, só ciência.',
    icon: (
      <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#0088d4" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#53b0ff" strokeWidth="3" strokeDasharray="6 4" />
        <circle cx="50" cy="50" r="15" fill="#53b0ff" opacity="0.2" />
        <text x="50" y="55" textAnchor="middle" fill="#53b0ff" fontSize="12" fontWeight="bold">ml</text>
      </svg>
    ),
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-950 px-6">
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md"
          >
            <div className="mb-8">{slides[current].icon}</div>
            <h2 className="text-3xl font-bold text-white mb-4">{slides[current].title}</h2>
            <p className="text-ocean-200 text-lg leading-relaxed">{slides[current].subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-12">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-ocean-400' : 'w-2 bg-ocean-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-semibold text-lg shadow-lg shadow-ocean-500/25 active:scale-95 transition-transform"
        >
          {current < slides.length - 1 ? 'Continuar' : 'Começar'}
        </button>
      </div>
    </div>
  );
}
