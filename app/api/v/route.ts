import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url)
    const secureId = searchParams.get("i") || ""
    const currentHost = searchParams.get("h") || ""
    const timestamp = searchParams.get("t") || Date.now().toString()

    // Aqui você registraria a visualização no Supabase
    // Por exemplo:
    // await supabase.from('clone_visits').insert({
    //   secure_id: secureId,
    //   clone_host: currentHost,
    //   ip: request.headers.get('x-forwarded-for') || 'unknown',
    //   user_agent: request.headers.get('user-agent') || 'unknown',
    //   referer: request.headers.get('referer') || 'unknown',
    //   timestamp: new Date(parseInt(timestamp)).toISOString()
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
    console.error("Error logging visit:", error)

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
