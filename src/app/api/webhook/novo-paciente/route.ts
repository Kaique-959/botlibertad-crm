import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-webhook-secret')
    if (token !== process.env.WEBHOOK_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { nome, telefone, whatsapp, email, data_nascimento, cpf, origem } = body

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: existing } = await supabaseAdmin
      .from('pacientes')
      .select('id')
      .or(`telefone.eq.${telefone},whatsapp.eq.${whatsapp}`)
      .maybeSingle()

    let pacienteId: string

    if (existing) {
      const { error } = await supabaseAdmin
        .from('pacientes')
        .update({
          nome,
          telefone: telefone || undefined,
          whatsapp: whatsapp || undefined,
          email: email || undefined,
          data_nascimento: data_nascimento || undefined,
          cpf: cpf || undefined,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) throw error
      pacienteId = existing.id
    } else {
      const { data, error } = await supabaseAdmin
        .from('pacientes')
        .insert({
          nome,
          telefone,
          whatsapp,
          email,
          data_nascimento,
          cpf,
          como_conheceu: origem || 'whatsapp',
        })
        .select('id')
        .single()

      if (error) throw error
      pacienteId = data.id
    }

    return NextResponse.json({
      success: true,
      paciente_id: pacienteId,
      novo: !existing,
    })
  } catch (error: any) {
    console.error('Webhook novo-paciente error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
