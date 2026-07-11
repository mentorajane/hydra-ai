'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nome: '', email: '', senha: '',
    idade: '', sexo: '', peso: '', altura: '',
    cidade: '', atividade_fisica: 'SEDENTARIO',
    gestante: false, amamentando: false,
    doenca_renal: false, diabetes: false,
    hipertensao: false, medicamentos_diureticos: false,
    trabalho_sentado: false,
    horario_acorda: '07:00', horario_dorme: '22:00',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-950 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-ocean-400' : 'bg-ocean-800'}`} />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Dados básicos</h2>
              <Input label="Nome" name="nome" value={form.nome} onChange={handleChange} />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
              <Input label="Senha" name="senha" type="password" value={form.senha} onChange={handleChange} />
              <Input label="Idade" name="idade" type="number" value={form.idade} onChange={handleChange} />
              <div>
                <label className="block text-sm text-ocean-300 mb-1">Sexo</label>
                <select name="sexo" value={form.sexo} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white">
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Dados físicos</h2>
              <Input label="Peso (kg)" name="peso" type="number" value={form.peso} onChange={handleChange} />
              <Input label="Altura (cm)" name="altura" type="number" value={form.altura} onChange={handleChange} />
              <Input label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} />
              <div>
                <label className="block text-sm text-ocean-300 mb-1">Nível de atividade física</label>
                <select name="atividade_fisica" value={form.atividade_fisica} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white">
                  <option value="SEDENTARIO">Sedentário</option>
                  <option value="LEVE">Leve (1-2x/semana)</option>
                  <option value="MODERADO">Moderado (3-4x/semana)</option>
                  <option value="INTENSO">Intenso (5-6x/semana)</option>
                  <option value="MUITO_INTENSO">Muito intenso (diário)</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" name="trabalho_sentado" checked={form.trabalho_sentado} onChange={handleChange} className="w-5 h-5 accent-ocean-500" />
                <label className="text-white">Trabalho sentado (computador)</label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Condições de saúde</h2>

              <Checkbox name="gestante" checked={form.gestante} onChange={handleChange} label="Gestante" />
              <Checkbox name="amamentando" checked={form.amamentando} onChange={handleChange} label="Amamentando" />
              <Checkbox name="doenca_renal" checked={form.doenca_renal} onChange={handleChange} label="Doença renal" />
              <Checkbox name="diabetes" checked={form.diabetes} onChange={handleChange} label="Diabetes" />
              <Checkbox name="hipertensao" checked={form.hipertensao} onChange={handleChange} label="Hipertensão" />
              <Checkbox name="medicamentos_diureticos" checked={form.medicamentos_diureticos} onChange={handleChange} label="Medicamentos diuréticos" />

              <div className="pt-4 space-y-4">
                <div>
                  <label className="block text-sm text-ocean-300 mb-1">Horário que acorda</label>
                  <input type="time" name="horario_acorda" value={form.horario_acorda} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-ocean-300 mb-1">Horário que dorme</label>
                  <input type="time" name="horario_dorme" value={form.horario_dorme} onChange={handleChange} className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white" />
                </div>
              </div>
            </>
          )}
        </motion.div>

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium">
              Voltar
            </button>
          )}
          <button
            onClick={step < 3 ? () => setStep(step + 1) : handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-semibold disabled:opacity-50"
          >
            {loading ? 'Carregando...' : step < 3 ? 'Próximo' : 'Criar conta'}
          </button>
        </div>

        <p className="text-center text-ocean-400 text-sm mt-6">
          Já tem conta? <Link href="/login" className="text-ocean-300 underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

function Input({ label, name, type = 'text', value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm text-ocean-300 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-ocean-500 focus:border-ocean-400 focus:ring-1 focus:ring-ocean-400 outline-none"
      />
    </div>
  );
}

function Checkbox({ name, checked, onChange, label }: any) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-5 h-5 accent-ocean-500" />
      <span className="text-white">{label}</span>
    </label>
  );
}
