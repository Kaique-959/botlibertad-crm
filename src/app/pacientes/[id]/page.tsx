'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase'
import {
  Phone,
  MessageCircle,
  Mail,
  Plus,
  Save,
  ArrowLeft,
  Stethoscope,
  CheckCircle,
  Calendar,
  User,
} from 'lucide-react'
import { EXAMES } from '@/lib/types'
import toast from 'react-hot-toast'

export default function PerfilPacientePage() {
  const { id } = useParams()
  const router = useRouter()
  const [paciente, setPaciente] = useState<any>(null)
  const [atendimentos, setAtendimentos] = useState<any[]>([])
  const [interacoes, setInteracoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showInteracao, setShowInteracao] = useState(false)
  const [showAtendimento, setShowAtendimento] = useState(false)
  const [novaInteracao, setNovaInteracao] = useState({ tipo: 'mensagem', descricao: '', canal: 'whatsapp' })
  const [novoAtendimento, setNovoAtendimento] = useState({
    tipo_exame: EXAMES[0].nome,
    status: 'lead',
    data_agendamento: '',
    valor: '',
    origem: 'whatsapp',
  })

  async function loadData() {
    const supabase = getSupabaseBrowser()
    const { data: p } = await supabase.from('pacientes').select('*').eq('id', id).single()
    if (p) {
      setPaciente(p)
      setObservacoes(p.observacoes || '')
    }

    const { data: ats } = await supabase
      .from('atendimentos')
      .select('*')
      .eq('paciente_id', id)
      .order('criado_em', { ascending: false })
    setAtendimentos(ats || [])

    const { data: ints } = await supabase
      .from('interacoes')
      .select('*')
      .eq('paciente_id', id)
      .order('criado_em', { ascending: false })
    setInteracoes(ints || [])

    setLoading(false)
  }

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function handleSaveObservacoes() {
    setSaving(true)
    const supabase = getSupabaseBrowser()
    const { error } = await supabase
      .from('pacientes')
      .update({ observacoes })
      .eq('id', id)
    if (error) toast.error('Erro ao salvar')
    else toast.success('Observações salvas!')
    setSaving(false)
  }

  async function handleAddInteracao(e: React.FormEvent) {
    e.preventDefault()
    const supabase = getSupabaseBrowser()
    const { error } = await supabase.from('interacoes').insert({
      paciente_id: id,
      tipo: novaInteracao.tipo,
      descricao: novaInteracao.descricao,
      canal: novaInteracao.canal,
    })
    if (error) toast.error('Erro ao registrar interação')
    else {
      toast.success('Interação registrada!')
      setShowInteracao(false)
      setNovaInteracao({ tipo: 'mensagem', descricao: '', canal: 'whatsapp' })
      loadData()
    }
  }

  async function handleAddAtendimento(e: React.FormEvent) {
    e.preventDefault()
    const supabase = getSupabaseBrowser()
    const { error } = await supabase.from('atendimentos').insert({
      paciente_id: id,
      tipo_exame: novoAtendimento.tipo_exame,
      status: novoAtendimento.status,
      data_agendamento: novoAtendimento.data_agendamento || null,
      valor: novoAtendimento.valor ? parseFloat(novoAtendimento.valor) : null,
      origem: novoAtendimento.origem,
    })
    if (error) toast.error('Erro ao criar atendimento')
    else {
      toast.success('Atendimento criado!')
      setShowAtendimento(false)
      setNovoAtendimento({
        tipo_exame: EXAMES[0].nome,
        status: 'lead',
        data_agendamento: '',
        valor: '',
        origem: 'whatsapp',
      })
      loadData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#0f3b5e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="card p-12 text-center">
        <User size={40} className="mx-auto text-[#d4d0c8] mb-3" />
        <p className="text-[#6b7280]">Paciente não encontrado</p>
      </div>
    )
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      lead: 'badge badge-lead',
      agendado: 'badge badge-agendado',
      realizado: 'badge badge-realizado',
      cancelado: 'badge badge-cancelado',
    }
    return map[s] || 'badge badge-lead'
  }

  const tipoBadge = (t: string) => {
    const map: Record<string, string> = {
      mensagem: 'bg-[#dbeafe] text-[#1e40af]',
      ligacao: 'bg-[#ede9fe] text-[#5b21b6]',
      agendamento: 'bg-[#d1fae5] text-[#065f46]',
      retorno: 'bg-[#fef3c7] text-[#92400e]',
    }
    return map[t] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#0f3b5e] transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="card p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0f3b5e]/5 rounded-2xl flex items-center justify-center">
              <User size={24} className="text-[#0f3b5e]" />
            </div>
            <div>
              <h1 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: '#0f3b5e' }}>
                {paciente.nome}
              </h1>
              <div className="flex flex-wrap gap-3 mt-1.5">
                {paciente.whatsapp && (
                  <a href={`https://wa.me/${paciente.whatsapp.replace(/\D/g, '')}`} target="_blank"
                    className="flex items-center gap-1.5 text-sm text-[#10b981] hover:text-[#059669] transition-colors">
                    <MessageCircle size={14} /> {paciente.whatsapp}
                  </a>
                )}
                {paciente.telefone && (
                  <a href={`tel:${paciente.telefone}`}
                    className="flex items-center gap-1.5 text-sm text-[#0f3b5e] hover:text-[#1a5a8a] transition-colors">
                    <Phone size={14} /> {paciente.telefone}
                  </a>
                )}
                {paciente.email && (
                  <span className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                    <Mail size={14} /> {paciente.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setShowAtendimento(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              Atendimento
            </button>
            <button onClick={() => setShowInteracao(true)} className="btn-secondary flex items-center gap-2">
              <Plus size={16} />
              Interação
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-7 pt-6 border-t border-[#eae7e2]">
          <div>
            <p className="text-xs text-[#9ca3af] uppercase tracking-wider font-medium">CPF</p>
            <p className="text-sm font-medium text-[#1a1a2e] mt-1">{paciente.cpf || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] uppercase tracking-wider font-medium">Nascimento</p>
            <p className="text-sm font-medium text-[#1a1a2e] mt-1">
              {paciente.data_nascimento ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR') : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] uppercase tracking-wider font-medium">Convênio</p>
            <p className="text-sm font-medium text-[#1a1a2e] mt-1">{paciente.convenio || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] uppercase tracking-wider font-medium">Origem</p>
            <p className="text-sm font-medium text-[#1a1a2e] mt-1">{paciente.como_conheceu || '—'}</p>
          </div>
        </div>
      </div>

      <div className="card p-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Observações</h2>
          <button onClick={handleSaveObservacoes} disabled={saving}
            className="text-sm text-[#0f3b5e] hover:text-[#1a5a8a] flex items-center gap-1.5 font-medium transition-colors">
            <Save size={14} />
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="input-field resize-none"
          rows={3}
          placeholder="Adicione observações sobre o paciente…"
        />
      </div>

      <div className="card p-7">
        <h2 className="section-title mb-5">Atendimentos</h2>
        {atendimentos.length === 0 ? (
          <div className="text-center py-8 text-[#9ca3af] text-sm">Nenhum atendimento registrado</div>
        ) : (
          <div className="space-y-2.5">
            {atendimentos.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-[#faf9f7] rounded-xl">
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-[#0f3b5e]/5 rounded-xl">
                    <Stethoscope size={16} className="text-[#0f3b5e]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e]">{a.tipo_exame}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      {a.data_agendamento ? new Date(a.data_agendamento).toLocaleDateString('pt-BR') : 'Sem data'}
                      {a.valor && ` • R$ ${Number(a.valor).toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {a.pago && <CheckCircle size={16} className="text-[#10b981]" />}
                  <span className={statusBadge(a.status)}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-7">
        <h2 className="section-title mb-5">Timeline de Interações</h2>
        {interacoes.length === 0 ? (
          <div className="text-center py-8 text-[#9ca3af] text-sm">Nenhuma interação registrada</div>
        ) : (
          <div className="relative pl-8 space-y-5">
            <div className="absolute left-3 top-1 bottom-0 w-px bg-[#eae7e2]" />
            {interacoes.map((i) => (
              <div key={i.id} className="relative">
                <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-[#0f3b5e] border-2 border-white shadow-sm" />
                <div className="bg-[#faf9f7] rounded-xl p-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${tipoBadge(i.tipo)}`}>
                      {i.tipo}
                    </span>
                    <span className="text-xs text-[#9ca3af]">via {i.canal}</span>
                    <span className="text-xs text-[#9ca3af] ml-auto">
                      {new Date(i.criado_em).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-[#6b7280]">{i.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showInteracao && (
        <div className="modal-overlay" onClick={() => setShowInteracao(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="section-title mb-5">Nova Interação</h3>
            <form onSubmit={handleAddInteracao} className="space-y-4">
              <select value={novaInteracao.tipo} onChange={(e) => setNovaInteracao({ ...novaInteracao, tipo: e.target.value })}
                className="input-field">
                <option value="mensagem">Mensagem</option>
                <option value="ligacao">Ligação</option>
                <option value="agendamento">Agendamento</option>
                <option value="retorno">Retorno</option>
              </select>
              <select value={novaInteracao.canal} onChange={(e) => setNovaInteracao({ ...novaInteracao, canal: e.target.value })}
                className="input-field">
                <option value="whatsapp">WhatsApp</option>
                <option value="telefone">Telefone</option>
                <option value="presencial">Presencial</option>
              </select>
              <textarea placeholder="Descrição da interação…" required value={novaInteracao.descricao}
                onChange={(e) => setNovaInteracao({ ...novaInteracao, descricao: e.target.value })}
                className="input-field resize-none" rows={3} />
              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setShowInteracao(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAtendimento && (
        <div className="modal-overlay" onClick={() => setShowAtendimento(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="section-title mb-5">Novo Atendimento</h3>
            <form onSubmit={handleAddAtendimento} className="space-y-4">
              <select value={novoAtendimento.tipo_exame}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, tipo_exame: e.target.value })}
                className="input-field">
                {EXAMES.map((e) => (<option key={e.id} value={e.nome}>{e.nome}</option>))}
              </select>
              <select value={novoAtendimento.status}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, status: e.target.value })}
                className="input-field">
                <option value="lead">Lead</option>
                <option value="agendado">Agendado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <input type="datetime-local" value={novoAtendimento.data_agendamento}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_agendamento: e.target.value })}
                className="input-field" />
              <input type="number" step="0.01" placeholder="Valor" value={novoAtendimento.valor}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, valor: e.target.value })}
                className="input-field" />
              <select value={novoAtendimento.origem}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, origem: e.target.value })}
                className="input-field">
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="indicacao">Indicação</option>
                <option value="site">Site</option>
              </select>
              <div className="flex gap-2.5 pt-2">
                <button type="button" onClick={() => setShowAtendimento(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
