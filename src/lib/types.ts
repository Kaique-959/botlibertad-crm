export interface Paciente {
  id: string
  nome: string
  telefone: string | null
  whatsapp: string | null
  email: string | null
  data_nascimento: string | null
  cpf: string | null
  convenio: string | null
  como_conheceu: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
}

export interface Atendimento {
  id: string
  paciente_id: string
  tipo_exame: string
  status: 'lead' | 'agendado' | 'realizado' | 'cancelado'
  data_agendamento: string | null
  data_realizacao: string | null
  valor: number | null
  pago: boolean
  origem: string | null
  observacoes: string | null
  criado_em: string
}

export interface Interacao {
  id: string
  paciente_id: string
  tipo: 'mensagem' | 'ligacao' | 'agendamento' | 'retorno'
  descricao: string
  canal: 'whatsapp' | 'telefone' | 'presencial'
  criado_em: string
}

export interface Usuario {
  id: string
  email: string
  nome: string
  role: 'admin' | 'atendente'
}

export const EXAMES = [
  { id: 1, nome: 'Audiometria' },
  { id: 2, nome: 'Imitanciometria' },
  { id: 3, nome: 'PAC - Processamento Auditivo Central' },
  { id: 4, nome: 'P300' },
  { id: 5, nome: 'BERA' },
  { id: 6, nome: 'Otoemissões Acústicas' },
  { id: 7, nome: 'Avaliação Neuropsicológica (TDAH, TEA, QI)' },
  { id: 8, nome: 'Aparelho Auditivo' },
  { id: 9, nome: 'TAAC - Treinamento Auditivo em Cabine' },
  { id: 10, nome: 'Outros Assuntos' },
]

export const STATUS_ATENDIMENTO = ['lead', 'agendado', 'realizado', 'cancelado'] as const

export const KANBAN_COLUNAS = [
  { id: 'lead', titulo: '📥 Lead', cor: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
  { id: 'agendado', titulo: '📅 Agendado', cor: 'bg-blue-100 border-blue-400 text-blue-800' },
  { id: 'realizado', titulo: '✅ Realizado', cor: 'bg-green-100 border-green-400 text-green-800' },
  { id: 'retorno', titulo: '🔄 Retorno', cor: 'bg-purple-100 border-purple-400 text-purple-800' },
  { id: 'inativo', titulo: '❌ Inativo', cor: 'bg-gray-100 border-gray-400 text-gray-800' },
] as const
