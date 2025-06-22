/**
 * Script para simular a detecção de um clone
 * Este script simula um site clonado carregando o script de proteção
 */

// Configurações de simulação
const ORIGINAL_DOMAIN = "minhapagina.com.br"
const CLONE_DOMAIN = "site-clonado.com"
const API_BASE_URL = "http://localhost:3000"

console.log("🔍 Simulando detecção de clone...")
console.log(`📌 Domínio original: ${ORIGINAL_DOMAIN}`)
console.log(`📌 Domínio do clone: ${CLONE_DOMAIN}`)

async function simulateCloneDetection() {
  try {
    // 1. Gerar o script mínimo para o domínio original
    console.log("\n1️⃣ Gerando script mínimo...")

    const scriptResponse = await fetch(`${API_BASE_URL}/api/simple-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: ORIGINAL_DOMAIN }),
    })

    if (!scriptResponse.ok) {
      throw new Error(`Erro ao gerar script: ${scriptResponse.status}`)
    }

    const scriptData = await scriptResponse.json()
    const minimalScript = scriptData.script

    console.log("✅ Script mínimo gerado com sucesso")

    // 2. Extrair a URL do script completo
    const urlMatch = minimalScript.match(/src=['"]([^'"]+)['"]/)
    if (!urlMatch) {
      throw new Error("URL do script completo não encontrada")
    }

    const scriptUrl = urlMatch[1]
    console.log(`🔗 URL do script completo: ${scriptUrl}`)

    // 3. Simular o carregamento do script completo a partir do domínio clonado
    console.log("\n2️⃣ Simulando carregamento do script completo a partir do clone...")

    // Construir a URL completa com os parâmetros necessários
    const fullUrl = new URL(`${API_BASE_URL}${scriptUrl}`)

    // Adicionar parâmetros que seriam enviados pelo site clonado
    fullUrl.searchParams.append("h", CLONE_DOMAIN) // hostname do clone

    const fullScriptResponse = await fetch(fullUrl.toString(), {
      headers: {
        Referer: `https://${CLONE_DOMAIN}/`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!fullScriptResponse.ok) {
      throw new Error(`Erro ao carregar script completo: ${fullScriptResponse.status}`)
    }

    const fullScript = await fullScriptResponse.text()
    console.log("✅ Script completo carregado com sucesso")
    console.log(`📊 Tamanho do script: ${fullScript.length} caracteres`)

    // 4. Verificar se o script contém as proteções esperadas
    console.log("\n3️⃣ Verificando proteções no script...")

    const protections = [
      { name: "Interferência visual", detected: fullScript.includes("blur") || fullScript.includes("shake") },
      { name: "Substituição de imagens", detected: fullScript.includes("images[i].src") },
      { name: "Correção de links", detected: fullScript.includes("links[j].href") },
      { name: "Rastreamento de eventos", detected: fullScript.includes("logEvent") },
    ]

    let allProtectionsDetected = true

    protections.forEach((protection) => {
      if (protection.detected) {
        console.log(`✅ Proteção detectada: ${protection.name}`)
      } else {
        console.warn(`⚠️ Proteção não detectada: ${protection.name}`)
        allProtectionsDetected = false
      }
    })

    if (allProtectionsDetected) {
      console.log("🎉 Todas as proteções foram detectadas no script!")
    } else {
      console.warn("⚠️ Algumas proteções não foram detectadas no script.")
    }

    // 5. Simular eventos que seriam registrados
    console.log("\n4️⃣ Simulando eventos que seriam registrados...")

    // Simular visualização de página
    const viewResponse = await fetch(`${API_BASE_URL}/api/v`, {
      method: "GET",
      headers: {
        Referer: `https://${CLONE_DOMAIN}/`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    console.log(`📝 Evento de visualização: ${viewResponse.ok ? "✅ Registrado" : "❌ Falhou"}`)

    // Simular clique
    const clickResponse = await fetch(`${API_BASE_URL}/api/e`, {
      method: "GET",
      headers: {
        Referer: `https://${CLONE_DOMAIN}/`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    console.log(`📝 Evento de clique: ${clickResponse.ok ? "✅ Registrado" : "❌ Falhou"}`)

    console.log("\n✨ Simulação concluída com sucesso!")
  } catch (error) {
    console.error("❌ Erro durante a simulação:", error)
  }
}

// Executar a simulação
simulateCloneDetection()
