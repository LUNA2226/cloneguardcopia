/**
 * Script para testar todos os endpoints da API
 */

async function testAPIEndpoints() {
  console.log("🧪 Testando endpoints da API...")

  const baseUrl = "http://localhost:3000"

  const endpoints = [
    {
      name: "Geração de script",
      method: "POST",
      url: "/api/simple-script",
      body: { domain: "teste.com" },
    },
    {
      name: "Script de proteção",
      method: "GET",
      url: "/api/s?i=dGVzdGUuY29t&h=clone.com",
    },
    {
      name: "Log de eventos",
      method: "GET",
      url: "/api/e?t=click&d=%7B%22x%22%3A100%7D&i=dGVzdGUuY29t&h=clone.com",
    },
    {
      name: "Log de visualizações",
      method: "GET",
      url: "/api/v?i=dGVzdGUuY29t&h=clone.com",
    },
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testando: ${endpoint.name}`)

      const options: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
      }

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body)
      }

      const response = await fetch(`${baseUrl}${endpoint.url}`, options)

      if (response.ok) {
        console.log(`✅ ${endpoint.name}: Status ${response.status}`)

        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const data = await response.json()
          console.log(`   📊 Resposta: ${JSON.stringify(data).substring(0, 100)}...`)
        } else if (contentType?.includes("javascript")) {
          const script = await response.text()
          console.log(`   📊 Script: ${script.length} caracteres`)
        }
      } else {
        console.log(`❌ ${endpoint.name}: Status ${response.status}`)
        const errorText = await response.text()
        console.log(`   ❌ Erro: ${errorText.substring(0, 200)}...`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Erro de conexão`)
      console.log(`   ❌ Detalhes: ${error}`)
    }
  }

  console.log("\n✨ Teste de endpoints concluído!")
}

testAPIEndpoints()
