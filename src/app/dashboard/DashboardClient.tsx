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
      cor: 'bg-blue-50 text-blue-600',
    },
    {
      titulo: 'Agendamentos na Semana',
      valor: agendamentosSemana,
      icon: CalendarCheck,
      cor: 'bg-green-50 text-green-600',
    },
    {
      titulo: 'Leads Aguardando',
      valor: leads,
      icon: MessageCircle,
      cor: 'bg-yellow-50 text-yellow-600',
    },
    {
      titulo: 'Faturamento no Mês',
      valor: `R$ ${faturamento.toFixed(2)}`,
      icon: DollarSign,
      cor: 'bg-purple-50 text-purple-600',
    },
  ]

  const chartData = Object.entries(examesCount).map(([nome, count]) => ({
    nome: nome.length > 20 ? nome.slice(0, 20) + '...' : nome,
    atendimentos: count,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a2744]">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.titulo} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{card.titulo}</span>
                <div className={`p-2 rounded-lg ${card.cor}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1a2744]">{card.valor}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a2744] mb-4">
            Atendimentos por Tipo de Exame
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="atendimentos" fill="#1a2744" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">
              Nenhum atendimento registrado ainda
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1a2744]">
                Últimos Pacientes
              </h2>
              <Link
                href="/pacientes"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            {ultimosPacientes.length > 0 ? (
              <div className="space-y-3">
                {ultimosPacientes.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/pacientes/${p.id}`}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1a2744]">{p.nome}</p>
                      <p className="text-xs text-gray-400">{p.whatsapp || p.telefone || '—'}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center">
                Nenhum paciente cadastrado
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1a2744]">
                Próximos Agendamentos
              </h2>
              <Link
                href="/agenda"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Ver agenda <ArrowRight size={14} />
              </Link>
            </div>
            {proximosAgendamentos.length > 0 ? (
              <div className="space-y-3">
                {proximosAgendamentos.map((a: any) => (
                  <Link
                    key={a.id}
                    href={`/pacientes/${a.paciente_id}`}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1a2744]">
                        {a.pacientes?.nome || 'Paciente'}
                      </p>
                      <p className="text-xs text-gray-400">{a.tipo_exame}</p>
                    </div>
                    <span className="text-xs font-medium text-blue-600">
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
              <p className="text-gray-400 text-sm py-4 text-center">
                Nenhum agendamento futuro
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
