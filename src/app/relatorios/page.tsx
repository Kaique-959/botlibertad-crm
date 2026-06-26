'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Download } from 'lucide-react'
import { EXAMES } from '@/lib/types'

const COLORS = ['#1a2744', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6b7280']

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('mes')
  const [atendimentos, setAtendimentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [periodo])

  async function loadData() {
    setLoading(true)
    const supabase = getSupabaseBrowser()
    let query = supabase.from('atendimentos').select('*')

    const now = new Date()
    if (periodo === 'mes') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      query = query.gte('criado_em', start.toISOString())
    } else if (periodo === 'trimestre') {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      query = query.gte('criado_em', start.toISOString())
    } else if (periodo === 'ano') {
      const start = new Date(now.getFullYear(), 0, 1)
      query = query.gte('criado_em', start.toISOString())
    }

    const { data } = await query
    setAtendimentos(data || [])
    setLoading(false)
  }

  const examesData = EXAMES.map((e) => ({
    name: e.nome.length > 20 ? e.nome.slice(0, 20) + '...' : e.nome,
    value: atendimentos.filter((a) => a.tipo_exame === e.nome).length,
  })).filter((e) => e.value > 0)

  const statusData = [
    { name: 'Lead', value: atendimentos.filter((a) => a.status === 'lead').length },
    { name: 'Agendado', value: atendimentos.filter((a) => a.status === 'agendado').length },
    { name: 'Realizado', value: atendimentos.filter((a) => a.status === 'realizado').length },
    { name: 'Cancelado', value: atendimentos.filter((a) => a.status === 'cancelado').length },
  ].filter((s) => s.value > 0)

  const total = atendimentos.length
  const realizados = atendimentos.filter((a) => a.status === 'realizado').length
  const taxaConversao = total > 0 ? ((realizados / total) * 100).toFixed(1) : '0'
  const faturamento = atendimentos
    .filter((a) => a.status === 'realizado')
    .reduce((acc, a) => acc + (a.valor || 0), 0)

  function exportCSV() {
    const headers = ['Paciente ID', 'Tipo Exame', 'Status', 'Data Agendamento', 'Valor', 'Origem']
    const rows = atendimentos.map((a) =>
      [a.paciente_id, a.tipo_exame, a.status, a.data_agendamento, a.valor, a.origem].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${periodo}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a2744]">Relatórios</h1>
        <div className="flex items-center gap-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
          >
            <option value="mes">Este Mês</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Este Ano</option>
            <option value="todo">Todo Período</option>
          </select>
          <button
            onClick={exportCSV}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Total de Atendimentos</p>
              <p className="text-2xl font-bold text-[#1a2744] mt-1">{total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Realizados</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{realizados}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{taxaConversao}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Faturamento</p>
              <p className="text-2xl font-bold text-green-600 mt-1">R$ {faturamento.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1a2744] mb-4">
                Atendimentos por Tipo de Exame
              </h2>
              {examesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={examesData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1a2744" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm py-8 text-center">Sem dados no período</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1a2744] mb-4">
                Distribuição por Status
              </h2>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm py-8 text-center">Sem dados no período</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
