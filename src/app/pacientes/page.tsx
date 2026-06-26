'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Plus, Filter, Phone, MessageCircle } from 'lucide-react'
import { EXAMES } from '@/lib/types'
import toast from 'react-hot-toast'

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filtroExame, setFiltroExame] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [novoPaciente, setNovoPaciente] = useState({
    nome: '',
    telefone: '',
    whatsapp: '',
    email: '',
  })

  async function loadPacientes() {
    setLoading(true)
    let query = getSupabaseBrowser()
      .from('pacientes')
      .select('*, atendimentos(*)')
      .order('criado_em', { ascending: false })

    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,whatsapp.ilike.%${search}%`)
    }

    const { data } = await query
    setPacientes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPacientes()
  }, [])

  const filtered = pacientes.filter((p) => {
    const atendimentos = p.atendimentos || []
    if (filtroExame && !atendimentos.some((a: any) => a.tipo_exame === filtroExame)) return false
    if (filtroStatus && !atendimentos.some((a: any) => a.status === filtroStatus)) return false
    return true
  })

  async function handleAddPaciente(e: React.FormEvent) {
    e.preventDefault()
    if (!novoPaciente.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    const { error } = await getSupabaseBrowser().from('pacientes').insert({
      nome: novoPaciente.nome,
      telefone: novoPaciente.telefone || null,
      whatsapp: novoPaciente.whatsapp || null,
      email: novoPaciente.email || null,
    })

    if (error) {
      toast.error('Erro ao criar paciente')
      return
    }

    toast.success('Paciente criado!')
    setShowModal(false)
    setNovoPaciente({ nome: '', telefone: '', whatsapp: '', email: '' })
    loadPacientes()
  }

  function getStatus(p: any): string {
    const ats = p.atendimentos || []
    if (ats.some((a: any) => a.status === 'lead')) return 'lead'
    if (ats.some((a: any) => a.status === 'agendado')) return 'agendado'
    if (ats.some((a: any) => a.status === 'realizado')) return 'realizado'
    if (ats.some((a: any) => a.status === 'cancelado')) return 'cancelado'
    return 'lead'
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      lead: 'bg-yellow-100 text-yellow-700',
      agendado: 'bg-blue-100 text-blue-700',
      realizado: 'bg-green-100 text-green-700',
      cancelado: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a2744]">Pacientes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#1a2744] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#2a3f66] transition-colors"
        >
          <Plus size={16} />
          Novo Paciente
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:border-transparent"
          />
        </div>
        <select
          value={filtroExame}
          onChange={(e) => setFiltroExame(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
        >
          <option value="">Todos os exames</option>
          {EXAMES.map((e) => (
            <option key={e.id} value={e.nome}>{e.nome}</option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
        >
          <option value="">Todos os status</option>
          <option value="lead">Lead</option>
          <option value="agendado">Agendado</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Nenhum paciente encontrado
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Nome</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Telefone</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Exame</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Data</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = getStatus(p)
                  const ultimoExame = (p.atendimentos || [])[0]
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/pacientes/${p.id}`} className="text-sm font-medium text-[#1a2744] hover:text-blue-600">
                          {p.nome}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.whatsapp || p.telefone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ultimoExame?.tipo_exame || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.whatsapp && (
                            <a
                              href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                          )}
                          {p.telefone && (
                            <a
                              href={`tel:${p.telefone}`}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ligar"
                            >
                              <Phone size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-[#1a2744] mb-4">Novo Paciente</h2>
            <form onSubmit={handleAddPaciente} className="space-y-3">
              <input
                type="text"
                placeholder="Nome completo *"
                required
                value={novoPaciente.nome}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, nome: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={novoPaciente.telefone}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, telefone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
              />
              <input
                type="text"
                placeholder="WhatsApp"
                value={novoPaciente.whatsapp}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
              />
              <input
                type="email"
                placeholder="Email"
                value={novoPaciente.email}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a3f66] transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
