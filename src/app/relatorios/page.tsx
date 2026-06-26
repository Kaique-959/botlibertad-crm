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
} from 'recharts'
import { Download } from 'lucide-react'
import { EXAMES } from '@/lib/types'

const COLORS = ['#0f3b5e', '#2dd4bf', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6b7280']

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('mes')
  const [atendimentos, setAtendimentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [periodo])

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
    name: e.nome.length > 22 ? e.nome.slice(0, 22) + '…' : e.nome,
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
  const faturamento = atendimentos.filter((a) => a.status === 'realizado').reduce((acc, a) => acc + (a.valor || 0), 0)

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
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="text-[#6b7280] text-sm mt-1">Métricas e desempenho da clínica</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="input-field w-40">
            <option value="mes">Este Mês</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="ano">Este Ano</option>
            <option value="todo">Todo Período</option>
          </select>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#0f3b5e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="card p-6">
              <p className="stat-label">Total de Atendimentos</p>
              <p className="stat-value mt-1">{total}</p>
            </div>
            <div className="card p-6">
              <p className="stat-label">Realizados</p>
              <p className="stat-value mt-1 text-[#10b981]">{realizados}</p>
            </div>
            <div className="card p-6">
              <p className="stat-label">Taxa de Conversão</p>
              <p className="stat-value mt-1 text-[#3b82f6]">{taxaConversao}%</p>
            </div>
            <div className="card p-6">
              <p className="stat-label">Faturamento</p>
              <p className="stat-value mt-1 text-[#10b981]">R$ {Number(faturamento).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="section-title mb-5">Atendimentos por Tipo de Exame</h2>
              {examesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={examesData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #eae7e2', boxShadow: '0 4px 12px rgba(15,59,94,0.06)', fontSize: '13px' }} />
                    <Bar dataKey="value" fill="#0f3b5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-[#9ca3af] text-sm">Sem dados no período</div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="section-title mb-5">Distribuição por Status</h2>
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
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #eae7e2', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-[#9ca3af] text-sm">Sem dados no período</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
