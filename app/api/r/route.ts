import { type NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

export const dynamic = "force-dynamic"

// Função para decodificar o ID seguro e obter o domínio original
async function getOriginalDomain(secureId: string): Promise<string | null> {
  // Em produção, isso buscaria do banco de dados
  // Para demonstração, vamos usar uma lógica simplificada

  // Domínios de teste
  const testDomains = ["minhapagina.com.br", "ofertaespecial.com", "cursoonline.net"]

  // Tenta encontrar o domínio que corresponde ao ID seguro
  for (const domain of testDomains) {
    const hash = createHash("sha256").update(domain).digest("hex").substring(0, 12)
    const encoded = Buffer.from(domain).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

    const generatedId = `${hash}${encoded.substring(0, 8)}`

    if (generatedId === secureId) {
      return domain
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url)
    const secureId = searchParams.get("i") || ""

    // Obtém o domínio original a partir do ID seguro
    const originalDomain = await getOriginalDomain(secureId)

    if (!originalDomain) {
      // Redireciona para um site genérico se o domínio não for encontrado
      return NextResponse.redirect("https://example.com")
    }

    // Redireciona para o checkout do domínio original
    return NextResponse.redirect(`https://${originalDomain}/checkout`)
  } catch (error) {
    console.error("Error in redirect:", error)

    // Redireciona para um site genérico em caso de erro
    return NextResponse.redirect("https://example.com")
  }
}
