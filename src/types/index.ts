// ── User ──

export interface UserProfile {
  id?: string;
  nome: string;
  foto_url: string;
  email?: string;
  telefone?: string;
  categoria?: string;
  role?: "paciente" | "profissional";
}

// ── Categories & Services ──

export interface Category {
  id: string;
  nome: string;
}

export interface Service {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string;
  duracao_minutos: number;
  preco: number;
  ativo?: boolean;
  sob_consulta?: boolean;
  foto_url?: string | null;
}

// ── Agendamentos ──

export type AgendamentoStatus =
  | "PENDENTE"
  | "CONFIRMADO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "FALTOU";

export interface Agendamento {
  id: string;
  servico_id: string;
  inicio: string;
  fim: string;
  status: AgendamentoStatus;
  observacao?: string | null;
  created_at: string;
  servico?: {
    id: string;
    nome: string;
    preco: number;
    duracao_minutos: number;
  } | null;
}

// ── Config ──

export interface AppConfig {
  hora_abertura: string;
  hora_fechamento: string;
  almoco_inicio: string;
  almoco_fim: string;
  dias_funcionamento: number[];
}

// ── Ficha de Tratamento ──

export interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  google_id?: string | null;
  data_nascimento?: string | null;
  nif?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SessaoTratamento {
  id: string;
  ficha_id: string;
  agendamento_id?: string | null;
  data_sessao: string;
  numero_sessao: number;
  zona_tratada: string;
  potencia?: string | null;
  ponteira?: string | null;
  observacoes?: string | null;
  profissional_id?: string | null;
  created_at: string;
}

export interface RegiaoAdicional {
  id: string;
  ficha_id: string;
  data_aquisicao: string;
  nova_regiao: string;
  sessoes: number;
  validade?: string | null;
  valor?: number | null;
  created_at: string;
}

export interface FichaTratamento {
  id: string;
  paciente_id: string;
  procedimento_zona: string;
  data_aquisicao: string;
  sessoes_adquiridas: number;
  validade?: string | null;
  observacoes_gerais?: string | null;
  created_at: string;
  updated_at: string;
  sessoes?: SessaoTratamento[];
  regioes_adicionais?: RegiaoAdicional[];
  paciente?: Paciente;
}

