-- Migration: Ficha de Tratamento (Depilação a Laser) & Evolução Técnica
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Adicionar campos complementares na tabela de pacientes
ALTER TABLE public.pacientes 
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS nif TEXT;

-- 2. Tabela de Fichas de Tratamento (Procedimentos Adquiridos pelo cliente)
CREATE TABLE IF NOT EXISTS public.fichas_tratamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  procedimento_zona TEXT NOT NULL, -- ex: "Depilação a Laser - Pernas Inteiras + Axilas"
  data_aquisicao DATE NOT NULL DEFAULT CURRENT_DATE,
  sessoes_adquiridas INT NOT NULL DEFAULT 10,
  validade DATE,
  observacoes_gerais TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Acompanhamento das Sessões (Evolução clínica/técnica)
CREATE TABLE IF NOT EXISTS public.sessoes_tratamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID NOT NULL REFERENCES public.fichas_tratamento(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  data_sessao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  numero_sessao INT NOT NULL, -- 1, 2, 3...
  zona_tratada TEXT NOT NULL, -- ex: "Axilas"
  potencia TEXT, -- ex: "18 J/cm²"
  ponteira TEXT, -- ex: "Spot 12mm / HR"
  observacoes TEXT, -- ex: "Pele com leve eritema, respondeu bem"
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Regiões Adicionais (Aquisição de outra região durante o tratamento)
CREATE TABLE IF NOT EXISTS public.regioes_adicionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID NOT NULL REFERENCES public.fichas_tratamento(id) ON DELETE CASCADE,
  data_aquisicao DATE NOT NULL DEFAULT CURRENT_DATE,
  nova_regiao TEXT NOT NULL,
  sessoes INT NOT NULL DEFAULT 1,
  validade DATE,
  valor NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) se necessário ou conceder permissão para o role service_role e anon/authenticated
ALTER TABLE public.fichas_tratamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_tratamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regioes_adicionais ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso livre para leitura e escrita (ou adaptar conforme sua política de RLS)
CREATE POLICY "Permitir tudo para fichas_tratamento" ON public.fichas_tratamento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para sessoes_tratamento" ON public.sessoes_tratamento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para regioes_adicionais" ON public.regioes_adicionais FOR ALL USING (true) WITH CHECK (true);
