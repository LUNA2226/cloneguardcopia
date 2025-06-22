import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { domain_id, client_id, clone_url, type } = await request.json()

    // Buscar dados do cliente e domínio
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select(`
        *,
        domains!inner (*)
      `)
      .eq("id", client_id)
      .eq("domains.id", domain_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const domain = client.domains[0]

    // Enviar email de alerta
    await resend.emails.send({
      from: "CloneGuard <alerts@cloneguard.com>",
      to: [client.email],
      subject: `🚨 Clone Detectado: ${domain.domain_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🚨 Clone Detectado</h2>
          <p>Detectamos um possível clone do seu site:</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Domínio Original:</strong> ${domain.domain_name}<br>
            <strong>Clone Detectado:</strong> <a href="${clone_url}" target="_blank">${clone_url}</a><br>
            <strong>Data/Hora:</strong> ${new Date().toLocaleString("pt-BR")}
          </div>
          
          <p>As proteções configuradas foram ativadas automaticamente.</p>
          
          <a href="https://cloneguard.com/dashboard" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Ver Detalhes no Dashboard
          </a>
        </div>
      `,
    })

    // Registrar notificação
    await supabase.from("notifications").insert({
      client_id,
      type: "email",
      title: "Clone Detectado",
      message: `Clone detectado em ${clone_url}`,
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending alert:", error)
    return NextResponse.json({ error: "Failed to send alert" }, { status: 500 })
  }
}
