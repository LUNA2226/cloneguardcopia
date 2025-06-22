import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain required" }, { status: 400 })
    }

    // Gerar uma chave aleatória para o domínio
    const apiKey = randomBytes(8).toString("hex")

    // Gerar script mínimo obfuscado
    const minimalScript = `<script>(function(){var s=document.createElement('script');s.src='/assets/a.js?k=${apiKey}&d=${encodeURIComponent(domain)}&h='+location.hostname;document.head.appendChild(s);})();</script>`

    return NextResponse.json({
      script: minimalScript,
      size: minimalScript.length,
      instructions: "Cole este código na seção <head> do seu site",
    })
  } catch (error) {
    console.error("Error generating minimal script:", error)
    return NextResponse.json(
      {
        error: "Generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
