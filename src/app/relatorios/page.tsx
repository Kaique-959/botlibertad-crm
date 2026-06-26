'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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
    if (periodo === 'mes') query = query.gte('criado_em', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
    else if (periodo === 'trimestre') query = query.gte('criado_em', new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString())
    else if (periodo === 'ano') query = query.gte('criado_em', new Date(now.getFullYear(), 0, 1).toISOString())
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
    const rows = atendimentos.map((a) => [a.paciente_id, a.tipo_exame, a.status, a.data_agendamento, a.valor, a.origem].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `relatorio-${periodo}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Métricas e desempenho da clínica</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="input-field w-36">
            <option value="mes">Este Mês</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Este Ano</option>
            <option value="todo">Todo período</option>
          </select>
          <button onClick={exportCSV} className="btn-secondary"><Download size={14} /> CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#0f3b5e] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5"><p className="stat-label">Total de Atendimentos</p><p className="text-2xl font-bold text-gray-900 mt-1">{total}</p></div>
            <div className="card p-5"><p className="stat-label">Realizados</p><p className="text-2xl font-bold text-emerald-600 mt-1">{realizados}</p></div>
            <div className="card p-5"><p className="stat-label">Taxa de Conversão</p><p className="text-2xl font-bold text-blue-600 mt-1">{taxaConversao}%</p></div>
            <div className="card p-5"><p className="stat-label">Faturamento</p><p className="text-2xl font-bold text-emerald-600 mt-1">R$ {Number(faturamento).toFixed(2)}</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Atendimentos por Tipo de Exame</h2>
              {examesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={examesData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '13px', padding: '8px 12px' }} />
                    <Bar dataKey="value" fill="#0f3b5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">Sem dados no período</div>}
            </div>

            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Distribuição por Status</h2>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                      label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">Sem dados no período</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
