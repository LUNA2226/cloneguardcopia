import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("t") || ""
    const eventData = searchParams.get("d") || "{}"
    const secureId = searchParams.get("i") || ""
    const currentHost = searchParams.get("h") || ""

    // Aqui você registraria o evento no Supabase
    // Por exemplo:
    // await supabase.from('clone_events').insert({
    //   secure_id: secureId,
    //   event_type: eventType,
    //   event_data: JSON.parse(eventData),
    //   clone_host: currentHost,
    //   ip: request.headers.get('x-forwarded-for') || 'unknown',
    //   user_agent: request.headers.get('user-agent') || 'unknown',
    //   created_at: new Date().toISOString()
    // })

    // Retorna uma imagem transparente de 1x1 pixel
    const transparentPixel = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    return new NextResponse(Buffer.from(transparentPixel, "base64"), {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error logging event:", error)

    // Retorna uma imagem transparente mesmo em caso de erro
    const transparentPixel = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    return new NextResponse(Buffer.from(transparentPixel, "base64"), {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  }
}
