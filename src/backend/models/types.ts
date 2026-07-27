export interface Configuracao {
  id: boolean;
  hora_abertura: string;
  hora_fechamento: string;
  almoco_inicio: string;
  almoco_fim: string;
  dias_funcionamento: number[];
  telefone?: string | null;
  logo_url?: string | null;
  nome_site?: string | null;
}

export interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  google_id?: string | null;
  data_nascimento?: string | null;
  nif?: string | null;
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
  email: string | null;
  categoria: 'desenvolvedor' | 'dono' | 'funcionario';
  status_acesso: 'pendente' | 'liberado';
  senha_hash: string | null;
  status_reset: 'nenhum' | 'pendente' | 'aprovado';
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
  sob_consulta: boolean;
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

