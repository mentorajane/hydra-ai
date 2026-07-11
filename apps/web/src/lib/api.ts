const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Não autorizado');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || 'Erro na requisição');
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (email: string, senha: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
    me: () => request('/auth/me'),
  },
  hydration: {
    hoje: () => request('/hydration/hoje'),
    registrar: (quantidade_ml: number, origem = 'manual') =>
      request('/hydration/registrar', { method: 'POST', body: JSON.stringify({ quantidade_ml, origem }) }),
    historico: (dias = 30) => request(`/hydration/historico?dias=${dias}`),
    camera: (imagem: string) => request('/hydration/camera', { method: 'POST', body: JSON.stringify({ imagem }) }),
  },
  goals: {
    atual: () => request('/goals/atual'),
    calcular: (temp?: number) => request(`/goals/calcular${temp ? `?temp=${temp}` : ''}`, { method: 'POST' }),
    recalcular: (temp?: number) => request(`/goals/recalcular${temp ? `?temp=${temp}` : ''}`, { method: 'POST' }),
  },
  notifications: {
    listar: (data?: string) => request(`/notifications${data ? `?data=${data}` : ''}`),
    gerarDia: () => request('/notifications/gerar-dia', { method: 'POST' }),
    confirmar: (id: string) => request(`/notifications/${id}/confirmar`, { method: 'POST' }),
    ignorar: (id: string) => request(`/notifications/${id}/ignorar`, { method: 'POST' }),
  },
  ai: {
    aprendizado: () => request('/ai/aprendizado'),
    aprender: () => request('/ai/aprender', { method: 'POST' }),
    conversar: (mensagem: string) => request('/ai/conversar', { method: 'POST', body: JSON.stringify({ mensagem }) }),
  },
  gamification: {
    status: () => request('/gamification'),
    verificarConquistas: () => request('/gamification/verificar-conquistas', { method: 'POST' }),
  },
  reports: {
    semanal: () => request('/reports/semanal'),
    mensal: () => request('/reports/mensal'),
    personalizado: (inicio: string, fim: string) => request(`/reports/personalizado?inicio=${inicio}&fim=${fim}`),
  },
  family: {
    vincular: (email: string, tipo: string) => request('/family/vincular', { method: 'POST', body: JSON.stringify({ email, tipo }) }),
    dependentes: () => request('/family/dependentes'),
    resumo: () => request('/family/resumo'),
  },
  users: {
    updatePerfil: (data: any) => request('/users/perfil', { method: 'PUT', body: JSON.stringify(data) }),
    updatePreferences: (data: any) => request('/users/preferencias', { method: 'PATCH', body: JSON.stringify(data) }),
    toggleModoIdoso: () => request('/users/modo-idoso', { method: 'PATCH' }),
  },
};
