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

    if (filtroExame) {
      query = query.eq('tipo_exame', filtroExame)
    }

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
        status: status,
      })
    })

    setColumns(newColumns)
    setLoading(false)
  }

  useEffect(() => {
    loadKanban()
  }, [filtroExame])

  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    if (source.droppableId === destination.droppableId) return

    const sourceCol = [...columns[source.droppableId]]
    const destCol = [...columns[destination.droppableId]]
    const [moved] = sourceCol.splice(source.index, 1)
    moved.status = destination.droppableId
    destCol.splice(destination.index, 0, moved)

    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    })

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

  function origemIcon(origem: string | null) {
    switch (origem) {
      case 'whatsapp': return <MessageCircle size={12} className="text-green-500" />
      case 'instagram': return <Camera size={12} className="text-pink-500" />
      case 'indicacao': return <UserPlus size={12} className="text-blue-500" />
      default: return <Globe size={12} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1a2744]">Kanban — Funil de Pacientes</h1>
        <select
          value={filtroExame}
          onChange={(e) => setFiltroExame(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
        >
          <option value="">Todos os exames</option>
          {EXAMES.map((e) => (
            <option key={e.id} value={e.nome}>{e.nome}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {KANBAN_COLUNAS.map((coluna) => (
              <div key={coluna.id} className="bg-gray-50 rounded-xl p-3">
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg mb-3 border ${coluna.cor}`}>
                  {coluna.titulo}
                  <span className="ml-2 opacity-60">{columns[coluna.id].length}</span>
                </div>

                <Droppable droppableId={coluna.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[200px] p-1 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {columns[coluna.id].map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg p-3 border border-gray-100 shadow-sm transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-[#1a2744]' : 'hover:shadow-md'
                              }`}
                            >
                              <Link
                                href={`/pacientes/${card.paciente_id}`}
                                className="block"
                              >
                                <p className="text-sm font-medium text-[#1a2744] mb-1">
                                  {card.paciente_nome}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">{card.tipo_exame}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {origemIcon(card.origem)}
                                  </div>
                                  {card.data_agendamento && (
                                    <span className="text-xs text-gray-400">
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
