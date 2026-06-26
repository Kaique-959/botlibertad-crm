'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import Link from 'next/link'
import { MessageCircle, Camera, Globe, UserPlus } from 'lucide-react'
import { EXAMES, KANBAN_COLUNAS } from '@/lib/types'
import toast from 'react-hot-toast'

interface CardData {
  id: string
  paciente_id: string
  paciente_nome: string
  tipo_exame: string
  data_agendamento: string | null
  origem: string | null
  status: string
}

export default function KanbanPage() {
  const [columns, setColumns] = useState<Record<string, CardData[]>>({
    lead: [],
    agendado: [],
    realizado: [],
    retorno: [],
    inativo: [],
  })
  const [filtroExame, setFiltroExame] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadKanban() {
    setLoading(true)
    const supabase = getSupabaseBrowser()
    let query = supabase
      .from('atendimentos')
      .select('*, pacientes(nome)')
      .order('criado_em', { ascending: false })

    if (filtroExame) query = query.eq('tipo_exame', filtroExame)

    const { data } = await query

    const newColumns: Record<string, CardData[]> = {
      lead: [],
      agendado: [],
      realizado: [],
      retorno: [],
      inativo: [],
    }

    ;(data || []).forEach((a: any) => {
      const status = a.status || 'lead'
      const colKey = newColumns[status] !== undefined ? status : 'lead'
      newColumns[colKey].push({
        id: a.id,
        paciente_id: a.paciente_id,
        paciente_nome: a.pacientes?.nome || 'Paciente',
        tipo_exame: a.tipo_exame || '',
        data_agendamento: a.data_agendamento,
        origem: a.origem,
        status,
      })
    })

    setColumns(newColumns)
    setLoading(false)
  }

  useEffect(() => { loadKanban() }, [filtroExame])

  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return
    const { source, destination, draggableId } = result
    if (source.droppableId === destination.droppableId) return

    const sourceCol = [...columns[source.droppableId]]
    const destCol = [...columns[destination.droppableId]]
    const [moved] = sourceCol.splice(source.index, 1)
    moved.status = destination.droppableId
    destCol.splice(destination.index, 0, moved)

    setColumns({ ...columns, [source.droppableId]: sourceCol, [destination.droppableId]: destCol })

    const supabase2 = getSupabaseBrowser()
    const { error } = await supabase2
      .from('atendimentos')
      .update({ status: destination.droppableId })
      .eq('id', draggableId)

    if (error) {
      toast.error('Erro ao atualizar status')
      loadKanban()
    } else {
      toast.success(`Movido para ${KANBAN_COLUNAS.find(c => c.id === destination.droppableId)?.titulo}`)
    }
  }, [columns])

  const origemIcon = (origem: string | null) => {
    switch (origem) {
      case 'whatsapp': return <MessageCircle size={12} className="text-[#10b981]" />
      case 'instagram': return <Camera size={12} className="text-pink-500" />
      case 'indicacao': return <UserPlus size={12} className="text-blue-500" />
      default: return <Globe size={12} className="text-[#9ca3af]" />
    }
  }

  const colunaCores: Record<string, { header: string; bg: string; dot: string }> = {
    lead: { header: 'bg-[#fef3c7] text-[#92400e]', bg: 'bg-[#fffbeb]', dot: 'bg-[#f59e0b]' },
    agendado: { header: 'bg-[#dbeafe] text-[#1e40af]', bg: 'bg-[#eff6ff]', dot: 'bg-[#3b82f6]' },
    realizado: { header: 'bg-[#d1fae5] text-[#065f46]', bg: 'bg-[#ecfdf5]', dot: 'bg-[#10b981]' },
    retorno: { header: 'bg-[#ede9fe] text-[#5b21b6]', bg: 'bg-[#f5f3ff]', dot: 'bg-[#8b5cf6]' },
    inativo: { header: 'bg-[#f3f4f6] text-[#4b5563]', bg: 'bg-[#f9fafb]', dot: 'bg-[#9ca3af]' },
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Kanban</h1>
          <p className="text-[#6b7280] text-sm mt-1">Funil de pacientes</p>
        </div>
        <select value={filtroExame} onChange={(e) => setFiltroExame(e.target.value)} className="input-field w-56">
          <option value="">Todos os exames</option>
          {EXAMES.map((e) => (<option key={e.id} value={e.nome}>{e.nome}</option>))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#0f3b5e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {KANBAN_COLUNAS.map((coluna) => {
              const cores = colunaCores[coluna.id] || colunaCores.lead
              return (
                <div key={coluna.id} className={`rounded-2xl ${cores.bg} p-3.5 min-h-[200px]`}>
                  <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl mb-3.5 ${cores.header}`}>
                    <div className={`w-2 h-2 rounded-full ${cores.dot}`} />
                    <span className="text-xs font-semibold uppercase tracking-wider">{coluna.titulo}</span>
                    <span className="text-xs font-semibold ml-auto opacity-60">{columns[coluna.id].length}</span>
                  </div>

                  <Droppable droppableId={coluna.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2.5 min-h-[150px] p-1 rounded-xl transition-colors ${
                          snapshot.isDraggingOver ? 'bg-white/60' : ''
                        }`}
                      >
                        {columns[coluna.id].map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-xl p-4 border border-[#eae7e2] shadow-sm transition-all duration-200 ${
                                  snapshot.isDragging
                                    ? 'shadow-lg ring-2 ring-[#2dd4bf] rotate-2'
                                    : 'hover:shadow-md hover:border-[#d4d0c8]'
                                }`}
                              >
                                <Link href={`/pacientes/${card.paciente_id}`} className="block">
                                  <p className="text-sm font-medium text-[#0f3b5e] mb-1">
                                    {card.paciente_nome}
                                  </p>
                                  <p className="text-xs text-[#6b7280] mb-2.5">{card.tipo_exame}</p>
                                  <div className="flex items-center justify-between">
                                    {origemIcon(card.origem)}
                                    {card.data_agendamento && (
                                      <span className="text-xs text-[#9ca3af]">
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
              )
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
