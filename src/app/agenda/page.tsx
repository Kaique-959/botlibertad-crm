'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import Calendar from 'react-calendar'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-calendar/dist/Calendar.css'

type ValuePiece = Date | null
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece]

export default function AgendaPage() {
  const [date, setDate] = useState<CalendarValue>(new Date())
  const [atendimentos, setAtendimentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAtendimentos() {
    setLoading(true)
    const supabase = getSupabaseBrowser()
    const { data } = await supabase
      .from('atendimentos')
      .select('*, pacientes(nome, whatsapp)')
      .eq('status', 'agendado')
      .order('data_agendamento', { ascending: true })

    setAtendimentos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadAtendimentos()
  }, [])

  const selectedDate = date instanceof Date ? date : new Date()

  const agendamentosDoDia = atendimentos.filter((a) => {
    if (!a.data_agendamento) return false
    const d = new Date(a.data_agendamento)
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    )
  })

  function tileContent({ date: tileDate }: { date: Date }) {
    const count = atendimentos.filter((a) => {
      if (!a.data_agendamento) return false
      const d = new Date(a.data_agendamento)
      return (
        d.getDate() === tileDate.getDate() &&
        d.getMonth() === tileDate.getMonth() &&
        d.getFullYear() === tileDate.getFullYear()
      )
    }).length

    if (count > 0) {
      return (
        <div className="flex justify-center mt-1">
          <span className="bg-[#1a2744] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        </div>
      )
    }
    return null
  }

  const examColors: Record<string, string> = {
    'Audiometria': 'border-l-blue-400',
    'Imitanciometria': 'border-l-green-400',
    'PAC': 'border-l-purple-400',
    'P300': 'border-l-orange-400',
    'BERA': 'border-l-red-400',
    'Otoemissões': 'border-l-teal-400',
    'Avaliação Neuropsicológica': 'border-l-pink-400',
    'Aparelho Auditivo': 'border-l-yellow-400',
    'TAAC': 'border-l-indigo-400',
  }

  function getBorderColor(exame: string): string {
    for (const [key, color] of Object.entries(examColors)) {
      if (exame.includes(key)) return color
    }
    return 'border-l-gray-400'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a2744]">Agenda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={tileContent}
            locale="pt-BR"
            prevLabel={<ChevronLeft size={18} />}
            nextLabel={<ChevronRight size={18} />}
            className="!border-0 !w-full !font-sans"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a2744] mb-4">
            Agendamentos — {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
          </h2>

          {loading ? (
            <p className="text-gray-400 text-sm py-8 text-center">Carregando...</p>
          ) : agendamentosDoDia.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">Nenhum agendamento para este dia</p>
          ) : (
            <div className="space-y-3">
              {agendamentosDoDia.map((a) => (
                <Link
                  key={a.id}
                  href={`/pacientes/${a.paciente_id}`}
                  className={`block p-4 bg-gray-50 rounded-lg border-l-4 ${getBorderColor(a.tipo_exame)} hover:bg-gray-100 transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1a2744]">
                        {a.pacientes?.nome || 'Paciente'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.tipo_exame}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#1a2744]">
                        {a.data_agendamento
                          ? new Date(a.data_agendamento).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </p>
                      {a.pacientes?.whatsapp && (
                        <p className="text-xs text-gray-400">{a.pacientes.whatsapp}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
