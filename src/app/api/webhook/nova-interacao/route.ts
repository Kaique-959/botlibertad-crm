import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-webhook-secret')
    if (token !== process.env.WEBHOOK_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { paciente_id, tipo, descricao, canal } = body

    if (!paciente_id || !descricao) {
      return NextResponse.json({ error: 'paciente_id e descricao são obrigatórios' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('interacoes')
      .insert({
        paciente_id,
        tipo: tipo || 'mensagem',
        descricao,
        canal: canal || 'whatsapp',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      interacao_id: data.id,
    })
  } catch (error: any) {
    console.error('Webhook nova-interacao error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
