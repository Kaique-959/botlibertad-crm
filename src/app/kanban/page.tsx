'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import Link from 'next/link'
import { MessageCircle, Camera, Globe, UserPlus } from 'lucide-react'
import { EXAMES } from '@/lib/types'
import toast from 'react-hot-toast'

interface CardData {
  id: string; paciente_id: string; paciente_nome: string
  tipo_exame: string; data_agendamento: string | null
  origem: string | null; status: string
}

const colunas = [
  { id: 'lead', titulo: 'Lead', cor: 'border-l-amber-400 bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  { id: 'agendado', titulo: 'Agendado', cor: 'border-l-blue-400 bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  { id: 'realizado', titulo: 'Realizado', cor: 'border-l-emerald-400 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  { id: 'retorno', titulo: 'Retorno', cor: 'border-l-violet-400 bg-violet-50 text-violet-700', dot: 'bg-violet-400' },
  { id: 'inativo', titulo: 'Inativo', cor: 'border-l-gray-400 bg-gray-50 text-gray-700', dot: 'bg-gray-400' },
]

export default function KanbanPage() {
  const [columns, setColumns] = useState<Record<string, CardData[]>>({ lead: [], agendado: [], realizado: [], retorno: [], inativo: [] })
  const [filtroExame, setFiltroExame] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadKanban() {
    setLoading(true)
    const supabase = getSupabaseBrowser()
    let query = supabase.from('atendimentos').select('*, pacientes(nome)').order('criado_em', { ascending: false })
    if (filtroExame) query = query.eq('tipo_exame', filtroExame)

    const { data } = await query
    const newColumns: Record<string, CardData[]> = { lead: [], agendado: [], realizado: [], retorno: [], inativo: [] }
    ;(data || []).forEach((a: any) => {
      const s = a.status || 'lead'
      if (newColumns[s]) newColumns[s].push({
        id: a.id, paciente_id: a.paciente_id, paciente_nome: a.pacientes?.nome || 'Paciente',
        tipo_exame: a.tipo_exame || '', data_agendamento: a.data_agendamento, origem: a.origem, status: s,
      })
    })
    setColumns(newColumns)
    setLoading(false)
  }

  useEffect(() => { loadKanban() }, [filtroExame])

  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination || result.source.droppableId === result.destination.droppableId) return
    const s = result.source, d = result.destination
    const sc = [...columns[s.droppableId]], dc = [...columns[d.droppableId]]
    const [m] = sc.splice(s.index, 1); m.status = d.droppableId; dc.splice(d.index, 0, m)
    setColumns({ ...columns, [s.droppableId]: sc, [d.droppableId]: dc })

    const { error } = await getSupabaseBrowser().from('atendimentos').update({ status: d.droppableId }).eq('id', result.draggableId)
    if (error) { toast.error('Erro ao atualizar'); loadKanban() }
    else toast.success(`Movido para ${colunas.find(c => c.id === d.droppableId)?.titulo}`)
  }, [columns])

  const origemIcon = (o: string | null) => {
    switch (o) {
      case 'whatsapp': return <MessageCircle size={12} className="text-emerald-500" />
      case 'instagram': return <Camera size={12} className="text-pink-500" />
      case 'indicacao': return <UserPlus size={12} className="text-blue-500" />
      default: return <Globe size={12} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Kanban</h1>
          <p className="page-subtitle">Funil de pacientes</p>
        </div>
        <select value={filtroExame} onChange={(e) => setFiltroExame(e.target.value)} className="input-field w-52">
          <option value="">Todos os exames</option>
          {EXAMES.map((e) => (<option key={e.id} value={e.nome}>{e.nome}</option>))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#0f3b5e] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {colunas.map((col) => (
              <div key={col.id} className="bg-gray-50/80 rounded-xl border border-gray-100">
                <div className={`flex items-center gap-2 px-4 py-3 border-b border-gray-100 ${col.cor.split(' ')[0]} rounded-t-xl`}>
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider">{col.titulo}</span>
                  <span className="text-xs font-medium text-gray-400 ml-auto">{columns[col.id].length}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`space-y-2 p-2.5 min-h-[180px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}>
                      {columns[col.id].map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              className={`bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm transition-all duration-150 ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-[#2dd4bf] rotate-1 scale-105' : 'hover:shadow-md hover:border-gray-200'
                              }`}>
                              <Link href={`/pacientes/${card.paciente_id}`} className="block">
                                <p className="text-sm font-semibold text-gray-900 mb-1">{card.paciente_nome}</p>
                                <p className="text-xs text-gray-500 mb-2.5">{card.tipo_exame}</p>
                                <div className="flex items-center justify-between">
                                  {origemIcon(card.origem)}
                                  {card.data_agendamento && (
                                    <span className="text-[11px] text-gray-400 font-medium">
                                      {new Date(card.data_agendamento).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
