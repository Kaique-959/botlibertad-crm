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
    const { data } = await supabase.from('atendimentos')
      .select('*, pacientes(nome, whatsapp)').eq('status', 'agendado').order('data_agendamento', { ascending: true })
    setAtendimentos(data || [])
    setLoading(false)
  }

  useEffect(() => { loadAtendimentos() }, [])

  const selectedDate = date instanceof Date ? date : new Date()

  const agendamentosDoDia = atendimentos.filter((a) => {
    if (!a.data_agendamento) return false
    const d = new Date(a.data_agendamento)
    return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
  })

  function tileContent({ date: tileDate }: { date: Date }) {
    const count = atendimentos.filter((a) => {
      if (!a.data_agendamento) return false
      const d = new Date(a.data_agendamento)
      return d.getDate() === tileDate.getDate() && d.getMonth() === tileDate.getMonth() && d.getFullYear() === tileDate.getFullYear()
    }).length
    if (count > 0) return (
      <div className="flex justify-center mt-0.5">
        <span className="bg-[#0f3b5e] text-white text-[10px] font-bold rounded-full flex items-center justify-center" style={{ width: '18px', height: '18px' }}>{count}</span>
      </div>
    )
    return null
  }

  const examColors: Record<string, string> = {
    'Audiometria': 'border-l-blue-400', 'Imitanciometria': 'border-l-emerald-400',
    'PAC': 'border-l-violet-400', 'P300': 'border-l-orange-400',
    'BERA': 'border-l-red-400', 'Otoemissões': 'border-l-teal-400',
    'Avaliação Neuropsicológica': 'border-l-pink-400', 'Aparelho Auditivo': 'border-l-amber-400',
    'TAAC': 'border-l-indigo-400',
  }

  function getBorderColor(exame: string): string {
    for (const [key, color] of Object.entries(examColors)) { if (exame.includes(key)) return color }
    return 'border-l-gray-300'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Agenda</h1>
        <p className="page-subtitle">Gerencie os agendamentos da clínica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <Calendar onChange={setDate} value={date} tileContent={tileContent}
            locale="pt-BR" prevLabel={<ChevronLeft size={18} />} nextLabel={<ChevronRight size={18} />}
            className="!border-0 !w-full !font-sans" />
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="w-5 h-5 border-2 border-[#0f3b5e] border-t-transparent rounded-full animate-spin" /></div>
          ) : agendamentosDoDia.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhum agendamento para este dia</div>
          ) : (
            <div className="space-y-2.5">
              {agendamentosDoDia.map((a) => (
                <Link key={a.id} href={`/pacientes/${a.paciente_id}`}
                  className={`block p-4 bg-gray-50 rounded-xl border-l-4 ${getBorderColor(a.tipo_exame)} hover:bg-white hover:shadow-sm transition-all`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.pacientes?.nome || 'Paciente'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.tipo_exame}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {a.data_agendamento ? new Date(a.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </p>
                      {a.pacientes?.whatsapp && <p className="text-xs text-gray-400">{a.pacientes.whatsapp}</p>}
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
