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
