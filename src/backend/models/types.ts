export interface Configuracao {
  id: boolean;
  hora_abertura: string;
  hora_fechamento: string;
  almoco_inicio: string;
  almoco_fim: string;
  dias_funcionamento: number[];
}

export interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  google_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profissional {
  id: string;
  nome: string;
  telefone?: string | null;
  foto_url?: string | null;
  prioridade: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nome: string;
}

export interface Servico {
  id: string;
  categoria_id: string;
  nome: string;
  descricao?: string | null;
  foto_url?: string | null;
  duracao_minutos: number;
  preco: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfissionalServico {
  profissional_id: string;
  servico_id: string;
}

export type AgendamentoStatus = 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO' | 'FALTOU';

export interface Agendamento {
  id: string;
  paciente_id: string;
  profissional_id: string;
  servico_id: string;
  inicio: string;
  fim: string;
  status: AgendamentoStatus;
  observacao?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BloqueioAgenda {
  id: string;
  profissional_id: string;
  inicio: string;
  fim: string;
  motivo: string;
}
