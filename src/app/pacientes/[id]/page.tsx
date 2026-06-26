'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase'
import {
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Plus,
  Save,
  ArrowLeft,
  Stethoscope,
  DollarSign,
  CheckCircle,
  XCircle,
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
    return <div className="text-center py-12 text-gray-400">Carregando...</div>
  }

  if (!paciente) {
    return <div className="text-center py-12 text-gray-400">Paciente não encontrado</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2744] transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a2744]">{paciente.nome}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {paciente.whatsapp && (
                <a
                  href={`https://wa.me/${paciente.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700"
                >
                  <MessageCircle size={14} /> {paciente.whatsapp}
                </a>
              )}
              {paciente.telefone && (
                <a href={`tel:${paciente.telefone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
                  <Phone size={14} /> {paciente.telefone}
                </a>
              )}
              {paciente.email && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={14} /> {paciente.email}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAtendimento(true)}
              className="bg-[#1a2744] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#2a3f66] transition-colors"
            >
              <Plus size={16} />
              Novo Atendimento
            </button>
            <button
              onClick={() => setShowInteracao(true)}
              className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Plus size={16} />
              Nova Interação
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">CPF</p>
            <p className="text-sm font-medium text-[#1a2744]">{paciente.cpf || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Data de Nascimento</p>
            <p className="text-sm font-medium text-[#1a2744]">
              {paciente.data_nascimento
                ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Convênio</p>
            <p className="text-sm font-medium text-[#1a2744]">{paciente.convenio || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Como Conheceu</p>
            <p className="text-sm font-medium text-[#1a2744]">{paciente.como_conheceu || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1a2744]">Observações</h2>
          <button
            onClick={handleSaveObservacoes}
            disabled={saving}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Save size={14} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744] resize-none"
          rows={3}
          placeholder="Adicione observações sobre o paciente..."
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a2744] mb-4">Atendimentos</h2>
        {atendimentos.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">Nenhum atendimento registrado</p>
        ) : (
          <div className="space-y-3">
            {atendimentos.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Stethoscope size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-[#1a2744]">{a.tipo_exame}</p>
                    <p className="text-xs text-gray-400">
                      {a.data_agendamento
                        ? new Date(a.data_agendamento).toLocaleDateString('pt-BR')
                        : 'Sem data'}
                      {a.valor && ` • R$ ${a.valor.toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.pago && <CheckCircle size={14} className="text-green-500" />}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    a.status === 'lead' ? 'bg-yellow-100 text-yellow-700' :
                    a.status === 'agendado' ? 'bg-blue-100 text-blue-700' :
                    a.status === 'realizado' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a2744] mb-4">Timeline de Interações</h2>
        {interacoes.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">Nenhuma interação registrada</p>
        ) : (
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200" />
            {interacoes.map((i) => (
              <div key={i.id} className="relative">
                <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-[#1a2744] border-2 border-white" />
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      i.tipo === 'mensagem' ? 'bg-blue-100 text-blue-700' :
                      i.tipo === 'ligacao' ? 'bg-purple-100 text-purple-700' :
                      i.tipo === 'agendamento' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {i.tipo}
                    </span>
                    <span className="text-xs text-gray-400">
                      via {i.canal}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(i.criado_em).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{i.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showInteracao && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#1a2744] mb-4">Nova Interação</h3>
            <form onSubmit={handleAddInteracao} className="space-y-3">
              <select
                value={novaInteracao.tipo}
                onChange={(e) => setNovaInteracao({ ...novaInteracao, tipo: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              >
                <option value="mensagem">Mensagem</option>
                <option value="ligacao">Ligação</option>
                <option value="agendamento">Agendamento</option>
                <option value="retorno">Retorno</option>
              </select>
              <select
                value={novaInteracao.canal}
                onChange={(e) => setNovaInteracao({ ...novaInteracao, canal: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="telefone">Telefone</option>
                <option value="presencial">Presencial</option>
              </select>
              <textarea
                placeholder="Descrição da interação..."
                required
                value={novaInteracao.descricao}
                onChange={(e) => setNovaInteracao({ ...novaInteracao, descricao: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744] resize-none"
                rows={3}
              />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowInteracao(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a3f66]">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAtendimento && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#1a2744] mb-4">Novo Atendimento</h3>
            <form onSubmit={handleAddAtendimento} className="space-y-3">
              <select
                value={novoAtendimento.tipo_exame}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, tipo_exame: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              >
                {EXAMES.map((e) => (
                  <option key={e.id} value={e.nome}>{e.nome}</option>
                ))}
              </select>
              <select
                value={novoAtendimento.status}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              >
                <option value="lead">Lead</option>
                <option value="agendado">Agendado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <input
                type="datetime-local"
                value={novoAtendimento.data_agendamento}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, data_agendamento: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor"
                value={novoAtendimento.valor}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, valor: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              />
              <select
                value={novoAtendimento.origem}
                onChange={(e) => setNovoAtendimento({ ...novoAtendimento, origem: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="indicacao">Indicação</option>
                <option value="site">Site</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAtendimento(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a3f66]">
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
