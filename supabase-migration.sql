-- ============================================
-- BotLibertad CRM — Supabase Migration
-- ============================================

-- 1. TABELA: pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  whatsapp text,
  email text,
  data_nascimento date,
  cpf text,
  convenio text,
  como_conheceu text,
  observacoes text,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- 2. TABELA: atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_exame text NOT NULL,
  status text NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'agendado', 'realizado', 'cancelado')),
  data_agendamento timestamptz,
  data_realizacao timestamptz,
  valor decimal(10,2),
  pago boolean DEFAULT false,
  origem text,
  observacoes text,
  criado_em timestamptz DEFAULT now()
);

-- 3. TABELA: interacoes
CREATE TABLE IF NOT EXISTS interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('mensagem', 'ligacao', 'agendamento', 'retorno')),
  descricao text NOT NULL,
  canal text NOT NULL DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp', 'telefone', 'presencial')),
  criado_em timestamptz DEFAULT now()
);

-- 4. TABELA: usuarios (metadados)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nome text NOT NULL,
  role text NOT NULL DEFAULT 'atendente' CHECK (role IN ('admin', 'atendente')),
  criado_em timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_atendimentos_paciente_id ON atendimentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos(status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_data ON atendimentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_interacoes_paciente_id ON interacoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_telefone ON pacientes(telefone);
CREATE INDEX IF NOT EXISTS idx_pacientes_whatsapp ON pacientes(whatsapp);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pacientes_atualizado_em
  BEFORE UPDATE ON pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

-- Row Level Security
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacoes ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários autenticados podem ler tudo
CREATE POLICY "Usuários autenticados podem ler pacientes"
  ON pacientes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir pacientes"
  ON pacientes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pacientes"
  ON pacientes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ler atendimentos"
  ON atendimentos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir atendimentos"
  ON atendimentos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar atendimentos"
  ON atendimentos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ler interacoes"
  ON interacoes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir interacoes"
  ON interacoes FOR INSERT TO authenticated WITH CHECK (true);
