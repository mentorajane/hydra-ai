'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        setError('Email ou senha inválidos');
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-950 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💧</div>
          <h1 className="text-3xl font-bold text-gradient">Hydra AI</h1>
          <p className="text-ocean-300 mt-1">Sua saúde começa com um gole</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-ocean-300 mb-1">Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-ocean-500 outline-none focus:border-ocean-400"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-ocean-300 mb-1">Senha</label>
          <input
            type="password" value={senha} onChange={e => setSenha(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-ocean-500 outline-none focus:border-ocean-400"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-semibold text-lg disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-center text-ocean-400 text-sm">
          Não tem conta? <Link href="/register" className="text-ocean-300 underline">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
