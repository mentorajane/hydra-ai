// ============= ENUMS =============
export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
}

export enum NivelAtividade {
  SEDENTARIO = 'SEDENTARIO',
  LEVE = 'LEVE',
  MODERADO = 'MODERADO',
  INTENSO = 'INTENSO',
  MUITO_INTENSO = 'MUITO_INTENSO',
}

export enum TipoNotificacao {
  LEMBRETE = 'LEMBRETE',
  ALERTA_PRIORIDADE = 'ALERTA_PRIORIDADE',
  META_ATUALIZADA = 'META_ATUALIZADA',
  CONQUISTA = 'CONQUISTA',
  RECORDATORIO = 'RECORDATORIO',
}

export enum StatusNotificacao {
  PENDENTE = 'PENDENTE',
  ENVIADA = 'ENVIADA',
  CONFIRMADA = 'CONFIRMADA',
  IGNORADA = 'IGNORADA',
}

export enum TipoConquista {
  DIAS_7 = '7_DIAS_HIDRATADO',
  DIAS_30 = '30_DIAS_HIDRATADO',
  LITROS_100 = '100_LITROS',
  PRIMEIRO_MES = 'PRIMEIRO_MES',
  MISSAO_COMPLETA = 'MISSAO_COMPLETA',
}

// ============= INTERFACES =============
export interface UsuarioData {
  nome: string;
  email: string;
  idade: number;
  sexo: Sexo;
  peso: number; // kg
  altura: number; // cm
  cidade: string;
  atividade_fisica: NivelAtividade;
  gestante: boolean;
  amamentando: boolean;
  doenca_renal: boolean;
  diabetes: boolean;
  hipertensao: boolean;
  medicamentos_diureticos: boolean;
  horario_acorda: string; // HH:mm
  horario_dorme: string; // HH:mm
  allow_notifications: boolean;
}

export interface MetaHidratacao {
  meta_ml: number;
  meta_ml_por_kg: number;
  quantidade_por_gole_ml: number;
  numero_lembretes: number;
  intervalos_minutos: number;
  calculada_em: Date;
  fatores_ajuste: FatoresAjuste;
}

export interface FatoresAjuste {
  peso_base: number;
  ajuste_clima_ml: number;
  ajuste_atividade_ml: number;
  ajuste_gestacao_ml: number;
  ajuste_amamentacao_ml: number;
  ajuste_doenca_ml: number;
  temperatura_atual: number;
  total_ml: number;
}

export interface RegistroHidratacao {
  id: string;
  usuario_id: string;
  quantidade_ml: number;
  data_hora: Date;
  origem: string; // manual, smartwatch, camera
}

export interface NotificacaoInteligente {
  id: string;
  usuario_id: string;
  tipo: TipoNotificacao;
  mensagem: string;
  horario_agendado: string; // HH:mm
  status: StatusNotificacao;
  criada_em: Date;
}

export interface AprendizadoIA {
  horarios_preferidos: string[];
  frequencia_ideal_minutos: number;
  taxa_resposta: number;
  horarios_ignorados: string[];
  padrao_consumo: PadraoConsumo;
  ultima_atualizacao: Date;
}

export interface PadraoConsumo {
  manha_ml: number;
  tarde_ml: number;
  noite_ml: number;
  horario_pico: string;
  horario_menor: string;
}

export interface RelatorioDiario {
  data: Date;
  total_ml: number;
  meta_ml: number;
  percentual: number;
  notificacoes_enviadas: number;
  notificacoes_confirmadas: number;
  humor?: number; // 1-5
  horas_sono?: number;
}

export interface PrevisaoClima {
  temperatura: number;
  umidade: number;
  descricao: string;
  cidade: string;
}

// ============= CONSTANTES =============
export const RECOMENDACOES_BASE = {
  // Institute of Medicine (IOM) + EFSA
  // Água total (incluindo alimentos): ~20-35% vem da comida
  HOMEM_ADULTO_ML: 3700, // ~3.7L total, ~2.5-2.6L de bebidas
  MULHER_ADULTA_ML: 2700, // ~2.7L total, ~2.0-2.1L de bebidas
  POR_KG_BASE: 35, // 35ml por kg é referência amplamente usada
  FATOR_IDADE_60_MAIS: 0.9, // redução de 10% para >60 anos
  FATOR_IDADE_70_MAIS: 0.85,
  GESTANTE_ADICIONAL_ML: 300,
  AMAMENTACAO_ADICIONAL_ML: 700,
  DIABETES_ADICIONAL_ML: 500,
  DOENCA_RENAL: null, // precisa avaliacao medica
  DIURETICO_ADICIONAL_ML: 300,
} as const;

export const POR_KG_ATIVIDADE: Record<NivelAtividade, number> = {
  [NivelAtividade.SEDENTARIO]: 35,
  [NivelAtividade.LEVE]: 40,
  [NivelAtividade.MODERADO]: 45,
  [NivelAtividade.INTENSO]: 50,
  [NivelAtividade.MUITO_INTENSO]: 55,
};
