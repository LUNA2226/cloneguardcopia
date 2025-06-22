/**
 * Script de teste para verificar a funcionalidade do CloneGuard
 * Este script simula diferentes cenários e verifica se tudo está funcionando corretamente
 */

// Simulação de ambiente de teste
console.log("🧪 Iniciando testes do CloneGuard...")

// 1. Teste de geração do script mínimo
async function testScriptGeneration() {
  console.log("\n📋 TESTE 1: Geração do script mínimo")

  try {
    // Simula uma requisição para gerar o script
    const response = await fetch("http://localhost:3000/api/simple-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "minhapagina.com.br" }),
    })

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const data = await response.json()

    // Verifica se o script foi gerado corretamente
    if (!data.script) {
      throw new Error("Script não foi gerado")
    }

    console.log("✅ Script gerado com sucesso")
    console.log(`📊 Tamanho do script: ${data.script.length} caracteres`)
    console.log(`🔑 ID gerado: ${data.id || "N/A"}`)

    // Verifica se o script não contém o nome do domínio explicitamente
    if (data.script.includes("minhapagina.com.br")) {
      console.warn("⚠️ AVISO: O script contém o nome do domínio explicitamente")
    } else {
      console.log("✅ O script não contém o nome do domínio explicitamente")
    }

    return data.script
  } catch (error) {
    console.error("❌ Erro ao gerar script:", error)
    return null
  }
}

// 2. Teste de carregamento do script completo
async function testScriptLoading(minimalScript: string | null) {
  console.log("\n📋 TESTE 2: Carregamento do script completo")

  if (!minimalScript) {
    console.error("❌ Não foi possível testar o carregamento do script completo")
    return
  }

  try {
    // Extrai a URL do script completo
    const urlMatch = minimalScript.match(/src=['"]([^'"]+)['"]/)
    if (!urlMatch) {
      throw new Error("URL do script completo não encontrada")
    }

    const scriptUrl = urlMatch[1]
    console.log(`🔍 URL do script completo: ${scriptUrl}`)

    // Simula uma requisição para carregar o script completo
    const baseUrl = "http://localhost:3000"
    const fullUrl = scriptUrl.startsWith("/") ? `${baseUrl}${scriptUrl}` : scriptUrl

    // Adiciona parâmetros necessários
    const urlWithParams = new URL(fullUrl)
    urlWithParams.searchParams.append("h", "site-clonado.com")

    const response = await fetch(urlWithParams.toString())

    if (!response.ok) {
      throw new Error(`Erro ao carregar script completo: ${response.status}`)
    }

    const scriptContent = await response.text()

    // Verifica se o script completo foi carregado corretamente
    if (!scriptContent || scriptContent.length < 100) {
      throw new Error("Script completo parece estar vazio ou muito pequeno")
    }

    console.log("✅ Script completo carregado com sucesso")
    console.log(`📊 Tamanho do script completo: ${scriptContent.length} caracteres`)

    // Verifica se o script contém as funções de proteção
    const hasProtectionFunctions =
      scriptContent.includes("applyProtections") ||
      scriptContent.includes("initProtection") ||
      scriptContent.includes("logEvent")

    if (hasProtectionFunctions) {
      console.log("✅ Script contém funções de proteção")
    } else {
      console.warn("⚠️ AVISO: Script não parece conter funções de proteção")
    }

    return scriptContent
  } catch (error) {
    console.error("❌ Erro ao carregar script completo:", error)
    return null
  }
}

// 3. Teste de integração com o banco de dados
async function testDatabaseIntegration() {
  console.log("\n📋 TESTE 3: Integração com o banco de dados")

  try {
    // Simula um evento de clone
    const response = await fetch("http://localhost:3000/api/log-clone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalDomain: "minhapagina.com.br",
        cloneDomain: "site-clonado.com",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        referrer: "https://google.com",
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro ao registrar evento: ${response.status}`)
    }

    const data = await response.json()

    if (data.success) {
      console.log("✅ Evento registrado com sucesso no banco de dados")
    } else {
      console.warn("⚠️ AVISO: Evento não foi registrado no banco de dados")
    }
  } catch (error) {
    console.error("❌ Erro ao testar integração com banco de dados:", error)
  }
}

// 4. Teste de obfuscação e segurança
function testObfuscationSecurity(minimalScript: string | null, fullScript: string | null) {
  console.log("\n📋 TESTE 4: Obfuscação e segurança")

  if (!minimalScript || !fullScript) {
    console.error("❌ Não foi possível testar obfuscação e segurança")
    return
  }

  // Lista de palavras-chave que não devem aparecer no script
  const sensitiveKeywords = [
    "clone",
    "guard",
    "security",
    "protection",
    "detect",
    "minhapagina.com.br",
    "ofertaespecial.com",
    "cursoonline.net",
  ]

  // Verifica o script mínimo
  console.log("🔍 Verificando script mínimo...")
  const minimalScriptIssues = sensitiveKeywords.filter((keyword) =>
    minimalScript.toLowerCase().includes(keyword.toLowerCase()),
  )

  if (minimalScriptIssues.length === 0) {
    console.log("✅ Script mínimo não contém palavras-chave sensíveis")
  } else {
    console.warn(`⚠️ AVISO: Script mínimo contém palavras-chave sensíveis: ${minimalScriptIssues.join(", ")}`)
  }

  // Verifica o script completo
  console.log("🔍 Verificando script completo...")
  const fullScriptIssues = sensitiveKeywords.filter((keyword) =>
    fullScript.toLowerCase().includes(keyword.toLowerCase()),
  )

  if (fullScriptIssues.length === 0) {
    console.log("✅ Script completo não contém palavras-chave sensíveis")
  } else {
    console.warn(`⚠️ AVISO: Script completo contém palavras-chave sensíveis: ${fullScriptIssues.join(", ")}`)
  }
}

// Executa todos os testes em sequência
async function runAllTests() {
  console.log("🚀 Iniciando bateria de testes do CloneGuard...\n")

  const minimalScript = await testScriptGeneration()
  const fullScript = await testScriptLoading(minimalScript)
  await testDatabaseIntegration()
  testObfuscationSecurity(minimalScript, fullScript)

  console.log("\n✨ Testes concluídos!")
}

// Executa os testes
runAllTests()
