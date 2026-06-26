'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Plus, Phone, MessageCircle, User, Calendar } from 'lucide-react'
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
    const ats = p.atendimentos || []
    if (filtroExame && !ats.some((a: any) => a.tipo_exame === filtroExame)) return false
    if (filtroStatus && !ats.some((a: any) => a.status === filtroStatus)) return false
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

  const statusBadgeMap: Record<string, string> = {
    lead: 'badge badge-lead',
    agendado: 'badge badge-agendado',
    realizado: 'badge badge-realizado',
    cancelado: 'badge badge-cancelado',
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="text-[#6b7280] text-sm mt-1">{filtered.length} paciente(s) cadastrado(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Novo Paciente
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filtroExame}
          onChange={(e) => setFiltroExame(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="">Todos os exames</option>
          {EXAMES.map((e) => (
            <option key={e.id} value={e.nome}>{e.nome}</option>
          ))}
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="input-field w-full sm:w-40"
        >
          <option value="">Todos os status</option>
          <option value="lead">Lead</option>
          <option value="agendado">Agendado</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#0f3b5e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <User size={40} className="mx-auto text-[#d4d0c8] mb-3" />
          <p className="text-[#6b7280]">Nenhum paciente encontrado</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#eae7e2]">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Nome</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Telefone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Exame</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Data</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#6b7280] uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = getStatus(p)
                  const ultimoExame = (p.atendimentos || [])[0]
                  return (
                    <tr key={p.id} className="border-b border-[#eae7e2]/50 hover:bg-[#faf9f7] transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/pacientes/${p.id}`}
                          className="text-sm font-medium text-[#0f3b5e] hover:text-[#1a5a8a] transition-colors"
                        >
                          {p.nome}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#6b7280]">{p.whatsapp || p.telefone || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-[#6b7280]">{ultimoExame?.tipo_exame || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={statusBadgeMap[status] || 'badge badge-lead'}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#9ca3af]">
                        {p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {p.whatsapp && (
                            <a
                              href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              className="p-2 text-[#10b981] hover:bg-[#d1fae5] rounded-lg transition-colors"
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}
                          {p.telefone && (
                            <a
                              href={`tel:${p.telefone}`}
                              className="p-2 text-[#0f3b5e] hover:bg-[#0f3b5e]/5 rounded-lg transition-colors"
                              title="Ligar"
                            >
                              <Phone size={15} />
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="section-title mb-5">Novo Paciente</h3>
            <form onSubmit={handleAddPaciente} className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo *"
                required
                value={novoPaciente.nome}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, nome: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={novoPaciente.telefone}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, telefone: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="WhatsApp"
                value={novoPaciente.whatsapp}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, whatsapp: e.target.value })}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Email"
                value={novoPaciente.email}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, email: e.target.value })}
                className="input-field"
              />
              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
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
