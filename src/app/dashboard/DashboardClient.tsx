'use client'

import {
  Users,
  CalendarCheck,
  MessageCircle,
  DollarSign,
  ArrowRight,
  TrendingUp,
  TrendingDown,
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
      corBg: 'bg-[#0f3b5e]',
    },
    {
      titulo: 'Agendamentos na Semana',
      valor: agendamentosSemana,
      icon: CalendarCheck,
      corIcon: 'text-[#2dd4bf]',
      corBg: 'bg-[#2dd4bf]',
    },
    {
      titulo: 'Leads Aguardando',
      valor: leads,
      icon: MessageCircle,
      corIcon: 'text-[#f59e0b]',
      corBg: 'bg-[#f59e0b]',
    },
    {
      titulo: 'Faturamento no Mês',
      valor: `R$ ${Number(faturamento).toFixed(2)}`,
      icon: DollarSign,
      corIcon: 'text-[#10b981]',
      corBg: 'bg-[#10b981]',
    },
  ]

  const chartData = Object.entries(examesCount).map(([nome, count]) => ({
    nome: nome.length > 22 ? nome.slice(0, 22) + '…' : nome,
    atendimentos: count,
  }))

  const hasData = chartData.length > 0

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral da clínica</p>
        </div>
        <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200">
          Atualizado agora
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.titulo} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="stat-label">{card.titulo}</span>
                <div className={`p-2.5 rounded-xl bg-opacity-10 ${card.corBg}`} style={{ backgroundColor: `${card.corBg.split('bg-')[1] ? `${card.corBg.replace('bg-', '')}` : ''}15` || 'rgba(15,59,94,0.08)' }}>
                  <Icon size={16} className={card.corIcon} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {card.valor}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title mb-5 flex items-center gap-2">
            Atendimentos por Tipo de Exame
            {hasData && <span className="text-xs text-gray-400 font-normal font-sans">({chartData.reduce((a, b) => a + b.atendimentos, 0)} total)</span>}
          </h2>
          {hasData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '13px',
                    padding: '8px 12px',
                  }}
                />
                <Bar dataKey="atendimentos" fill="#0f3b5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              <div className="text-center">
                <BarChart width={40} height={40} className="mx-auto mb-3 text-gray-200" />
                <p>Nenhum atendimento registrado ainda</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Últimos Pacientes</h2>
              <Link href="/pacientes" className="text-xs font-medium text-[#0f3b5e] hover:text-[#1a5a8a] flex items-center gap-1 transition-colors">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {ultimosPacientes.length > 0 ? (
              <div className="space-y-0.5">
                {ultimosPacientes.map((p: any, i: number) => (
                  <Link
                    key={p.id}
                    href={`/pacientes/${p.id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors -mx-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {p.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.nome}</p>
                        <p className="text-xs text-gray-400">{p.whatsapp || p.telefone || '—'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">Nenhum paciente cadastrado</div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Próximos Agendamentos</h2>
              <Link href="/agenda" className="text-xs font-medium text-[#0f3b5e] hover:text-[#1a5a8a] flex items-center gap-1 transition-colors">
                Ver agenda <ArrowRight size={12} />
              </Link>
            </div>
            {proximosAgendamentos.length > 0 ? (
              <div className="space-y-0.5">
                {proximosAgendamentos.map((a: any) => (
                  <Link
                    key={a.id}
                    href={`/pacientes/${a.paciente_id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors -mx-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.pacientes?.nome || 'Paciente'}</p>
                        <p className="text-xs text-gray-400">{a.tipo_exame}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-900 bg-gray-50 px-2.5 py-1 rounded-full">
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
              <div className="text-center py-8 text-gray-400 text-sm">Nenhum agendamento futuro</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
