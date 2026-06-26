import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-webhook-secret')
    if (token !== process.env.WEBHOOK_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { paciente_id, tipo_exame, data_agendamento, valor, origem } = body

    if (!paciente_id || !tipo_exame) {
      return NextResponse.json({ error: 'paciente_id e tipo_exame são obrigatórios' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('atendimentos')
      .insert({
        paciente_id,
        tipo_exame,
        status: 'agendado',
        data_agendamento: data_agendamento || null,
        valor: valor ? parseFloat(valor) : null,
        origem: origem || 'whatsapp',
      })
      .select('id')
      .single()

    if (error) throw error

    await supabaseAdmin
      .from('interacoes')
      .insert({
        paciente_id,
        tipo: 'agendamento',
        descricao: `Agendamento de ${tipo_exame} em ${data_agendamento ? new Date(data_agendamento).toLocaleString('pt-BR') : 'data a definir'}`,
        canal: 'whatsapp',
      })

    return NextResponse.json({
      success: true,
      atendimento_id: data.id,
    })
  } catch (error: any) {
    console.error('Webhook agendamento error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
