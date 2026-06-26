import { supabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await supabaseServer()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: pacientes } = await supabase.from('pacientes').select('id')
  const { data: atendimentos } = await supabase.from('atendimentos').select('*')

  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())
  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(inicioSemana.getDate() + 7)

  const agendamentosSemana = atendimentos?.filter((a) => {
    if (!a.data_agendamento) return false
    const d = new Date(a.data_agendamento)
    return d >= inicioSemana && d <= fimSemana && a.status === 'agendado'
  })

  const leads = atendimentos?.filter((a) => a.status === 'lead')
  const realizados = atendimentos?.filter((a) => a.status === 'realizado')
  const faturamento = realizados?.reduce((acc, a) => acc + (a.valor || 0), 0) || 0

  const totalPacientes = pacientes?.length || 0

  const examesCount: Record<string, number> = {}
  atendimentos?.forEach((a) => {
    if (a.tipo_exame) examesCount[a.tipo_exame] = (examesCount[a.tipo_exame] || 0) + 1
  })

  const { data: ultimosPacientes } = await supabase
    .from('pacientes')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(5)

  const { data: proximosAgendamentos } = await supabase
    .from('atendimentos')
    .select('*, pacientes(nome, whatsapp)')
    .eq('status', 'agendado')
    .order('data_agendamento', { ascending: true })
    .limit(5)

  return (
    <DashboardClient
      totalPacientes={totalPacientes}
      agendamentosSemana={agendamentosSemana?.length || 0}
      leads={leads?.length || 0}
      faturamento={faturamento}
      examesCount={examesCount}
      ultimosPacientes={ultimosPacientes || []}
      proximosAgendamentos={proximosAgendamentos || []}
    />
  )
}
