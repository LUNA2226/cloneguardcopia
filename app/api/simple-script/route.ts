import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Função simplificada para codificar o domínio
function encodeSecurely(domain: string): string {
  try {
    // Versão simplificada para evitar erros
    const encoded = Buffer.from(domain).toString("base64").replace(/=/g, "")
    return encoded.substring(0, 16)
  } catch (error) {
    console.error("Error encoding domain:", error)
    // Fallback seguro
    return Buffer.from(Date.now().toString()).toString("base64").substring(0, 16)
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    let domain = ""
    try {
      const body = await request.json()
      domain = body.domain || ""
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({
        error: "Invalid request body",
        script: "// Error: Invalid request",
      })
    }

    if (!domain) {
      return NextResponse.json({
        error: "Parameter required",
        script: "// Error: Parameter required",
      })
    }

    // Gera um identificador seguro para o domínio
    const secureId = encodeSecurely(domain)

    // Cria um script que não revela o domínio original
    // Versão simplificada para evitar erros
    const script = `<script>(function(){var d=document;var s=d.createElement('script');s.async=1;s.src='/api/s?i=${secureId}&h='+encodeURIComponent(location.hostname);d.head.appendChild(s)})();</script>`

    return NextResponse.json({
      script,
      size: script.length,
      id: secureId.substring(0, 8),
    })
  } catch (error) {
    console.error("Error in script generation:", error)
    // Garantir que sempre retorne JSON válido
    return NextResponse.json({
      error: "Generation failed",
      details: error instanceof Error ? error.message : "Unknown error",
      script: "// Error generating script",
    })
  }
}
