'use client'

import {
  Users,
  CalendarCheck,
  MessageCircle,
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  totalPacientes: number
  agendamentosSemana: number
  leads: number
  faturamento: number
  examesCount: Record<string, number>
  ultimosPacientes: any[]
  proximosAgendamentos: any[]
}

export default function DashboardClient({
  totalPacientes,
  agendamentosSemana,
  leads,
  faturamento,
  examesCount,
  ultimosPacientes,
  proximosAgendamentos,
}: Props) {
  const cards = [
    {
      titulo: 'Total de Pacientes',
      valor: totalPacientes,
      icon: Users,
      corIcon: 'text-[#0f3b5e]',
      corBg: 'bg-[#0f3b5e]/5',
    },
    {
      titulo: 'Agendamentos na Semana',
      valor: agendamentosSemana,
      icon: CalendarCheck,
      corIcon: 'text-[#2dd4bf]',
      corBg: 'bg-[#2dd4bf]/10',
    },
    {
      titulo: 'Leads Aguardando',
      valor: leads,
      icon: MessageCircle,
      corIcon: 'text-[#f59e0b]',
      corBg: 'bg-[#f59e0b]/10',
    },
    {
      titulo: 'Faturamento no Mês',
      valor: `R$ ${Number(faturamento).toFixed(2)}`,
      icon: DollarSign,
      corIcon: 'text-[#10b981]',
      corBg: 'bg-[#10b981]/10',
      isCurrency: true,
    },
  ]

  const chartData = Object.entries(examesCount).map(([nome, count]) => ({
    nome: nome.length > 22 ? nome.slice(0, 22) + '…' : nome,
    atendimentos: count,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-[#6b7280] text-sm mt-1">Visão geral da clínica</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.titulo} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="stat-label">{card.titulo}</span>
                <div className={`p-2.5 rounded-xl ${card.corBg}`}>
                  <Icon size={18} className={card.corIcon} />
                </div>
              </div>
              <p className={`${card.isCurrency ? 'text-2xl' : 'stat-value'}`}>
                {card.valor}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title mb-5">Atendimentos por Tipo de Exame</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #eae7e2',
                    boxShadow: '0 4px 12px rgba(15,59,94,0.06)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="atendimentos" fill="#0f3b5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-[#9ca3af] text-sm">
              Nenhum atendimento registrado ainda
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Últimos Pacientes</h2>
              <Link
                href="/pacientes"
                className="text-sm text-[#0f3b5e] hover:text-[#1a5a8a] flex items-center gap-1 font-medium transition-colors"
              >
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            {ultimosPacientes.length > 0 ? (
              <div className="space-y-1">
                {ultimosPacientes.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/pacientes/${p.id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#faf9f7] transition-colors -mx-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1a1a2e]">{p.nome}</p>
                      <p className="text-xs text-[#9ca3af]">{p.whatsapp || p.telefone || '—'}</p>
                    </div>
                    <span className="text-xs text-[#9ca3af]">
                      {p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#9ca3af] text-sm">
                Nenhum paciente cadastrado
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Próximos Agendamentos</h2>
              <Link
                href="/agenda"
                className="text-sm text-[#0f3b5e] hover:text-[#1a5a8a] flex items-center gap-1 font-medium transition-colors"
              >
                Ver agenda <ArrowRight size={14} />
              </Link>
            </div>
            {proximosAgendamentos.length > 0 ? (
              <div className="space-y-1">
                {proximosAgendamentos.map((a: any) => (
                  <Link
                    key={a.id}
                    href={`/pacientes/${a.paciente_id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[#faf9f7] transition-colors -mx-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1a1a2e]">
                        {a.pacientes?.nome || 'Paciente'}
                      </p>
                      <p className="text-xs text-[#9ca3af]">{a.tipo_exame}</p>
                    </div>
                    <span className="text-xs font-medium text-[#0f3b5e]">
                      {a.data_agendamento
                        ? new Date(a.data_agendamento).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#9ca3af] text-sm">
                Nenhum agendamento futuro
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
