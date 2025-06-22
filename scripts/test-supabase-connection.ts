/**
 * Script para verificar a conexão com o Supabase
 * Este script testa todas as operações do banco de dados
 */

import { createClient } from "@supabase/supabase-js"

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

console.log("🔍 Verificando conexão com Supabase...")
console.log(`📍 URL: ${supabaseUrl || "❌ NÃO CONFIGURADA"}`)
console.log(`🔑 Anon Key: ${supabaseAnonKey ? "✅ CONFIGURADA" : "❌ NÃO CONFIGURADA"}`)
console.log(`🔐 Service Key: ${supabaseServiceKey ? "✅ CONFIGURADA" : "❌ NÃO CONFIGURADA"}`)

// Inicializa os clientes Supabase
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

async function testSupabaseConnection() {
  console.log("\n🧪 TESTE 1: Conexão básica com Supabase")

  try {
    // Teste básico de conexão
    const { data, error } = await supabaseAnon
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(1)

    if (error) {
      console.error("❌ Erro na conexão básica:", error.message)
      return false
    }

    console.log("✅ Conexão básica com Supabase estabelecida")
    return true
  } catch (error) {
    console.error("❌ Erro ao conectar com Supabase:", error)
    return false
  }
}

async function testTablesExist() {
  console.log("\n🧪 TESTE 2: Verificando se as tabelas existem")

  const requiredTables = ["clients", "domains", "clone_attempts", "user_protection_settings", "scripts"]

  try {
    const { data: tables, error } = await supabaseService
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", requiredTables)

    if (error) {
      console.error("❌ Erro ao verificar tabelas:", error.message)
      return false
    }

    const existingTables = tables?.map((t) => t.table_name) || []

    console.log("📊 Tabelas encontradas:")
    requiredTables.forEach((table) => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`)
      } else {
        console.log(`   ❌ ${table} - NÃO EXISTE`)
      }
    })

    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    if (missingTables.length > 0) {
      console.warn(`⚠️ Tabelas faltando: ${missingTables.join(", ")}`)
      return false
    }

    console.log("✅ Todas as tabelas necessárias existem")
    return true
  } catch (error) {
    console.error("❌ Erro ao verificar tabelas:", error)
    return false
  }
}

async function testInsertData() {
  console.log("\n🧪 TESTE 3: Testando inserção de dados")

  try {
    // Teste de inserção na tabela clients
    const testClient = {
      name: "Cliente Teste",
      email: "teste@exemplo.com",
      created_at: new Date().toISOString(),
    }

    const { data: clientData, error: clientError } = await supabaseService
      .from("clients")
      .insert(testClient)
      .select()
      .single()

    if (clientError) {
      console.error("❌ Erro ao inserir cliente:", clientError.message)
      return false
    }

    console.log("✅ Cliente de teste inserido com sucesso")
    const clientId = clientData.id

    // Teste de inserção na tabela domains
    const testDomain = {
      client_id: clientId,
      domain: "teste-exemplo.com",
      status: "active",
      created_at: new Date().toISOString(),
    }

    const { data: domainData, error: domainError } = await supabaseService
      .from("domains")
      .insert(testDomain)
      .select()
      .single()

    if (domainError) {
      console.error("❌ Erro ao inserir domínio:", domainError.message)
      return false
    }

    console.log("✅ Domínio de teste inserido com sucesso")
    const domainId = domainData.id

    // Teste de inserção na tabela clone_attempts
    const testCloneAttempt = {
      domain_id: domainId,
      original_domain: "teste-exemplo.com",
      clone_domain: "clone-teste.com",
      ip_address: "192.168.1.1",
      user_agent: "Test User Agent",
      created_at: new Date().toISOString(),
    }

    const { error: cloneError } = await supabaseService.from("clone_attempts").insert(testCloneAttempt)

    if (cloneError) {
      console.error("❌ Erro ao inserir tentativa de clone:", cloneError.message)
      return false
    }

    console.log("✅ Tentativa de clone de teste inserida com sucesso")

    // Limpeza dos dados de teste
    await supabaseService.from("clone_attempts").delete().eq("domain_id", domainId)
    await supabaseService.from("domains").delete().eq("id", domainId)
    await supabaseService.from("clients").delete().eq("id", clientId)

    console.log("✅ Dados de teste removidos com sucesso")
    return true
  } catch (error) {
    console.error("❌ Erro ao testar inserção de dados:", error)
    return false
  }
}

async function testQueryData() {
  console.log("\n🧪 TESTE 4: Testando consulta de dados")

  try {
    // Teste de consulta na tabela clients
    const { data: clients, error: clientsError } = await supabaseService.from("clients").select("*").limit(5)

    if (clientsError) {
      console.error("❌ Erro ao consultar clientes:", clientsError.message)
      return false
    }

    console.log(`✅ Consulta de clientes bem-sucedida (${clients?.length || 0} registros)`)

    // Teste de consulta na tabela domains
    const { data: domains, error: domainsError } = await supabaseService.from("domains").select("*").limit(5)

    if (domainsError) {
      console.error("❌ Erro ao consultar domínios:", domainsError.message)
      return false
    }

    console.log(`✅ Consulta de domínios bem-sucedida (${domains?.length || 0} registros)`)

    // Teste de consulta na tabela clone_attempts
    const { data: attempts, error: attemptsError } = await supabaseService.from("clone_attempts").select("*").limit(5)

    if (attemptsError) {
      console.error("❌ Erro ao consultar tentativas de clone:", attemptsError.message)
      return false
    }

    console.log(`✅ Consulta de tentativas de clone bem-sucedida (${attempts?.length || 0} registros)`)

    return true
  } catch (error) {
    console.error("❌ Erro ao testar consulta de dados:", error)
    return false
  }
}

async function testRealTimeFeatures() {
  console.log("\n🧪 TESTE 5: Testando recursos em tempo real")

  try {
    // Teste de subscription (real-time)
    const channel = supabaseAnon
      .channel("test-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "clone_attempts" }, (payload) => {
        console.log("📡 Evento em tempo real recebido:", payload)
      })
      .subscribe()

    // Aguarda um momento para estabelecer a conexão
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (channel.state === "SUBSCRIBED") {
      console.log("✅ Subscription em tempo real estabelecida")

      // Remove a subscription
      await supabaseAnon.removeChannel(channel)
      console.log("✅ Subscription removida com sucesso")
      return true
    } else {
      console.warn("⚠️ Não foi possível estabelecer subscription em tempo real")
      return false
    }
  } catch (error) {
    console.error("❌ Erro ao testar recursos em tempo real:", error)
    return false
  }
}

async function runAllSupabaseTests() {
  console.log("🚀 Iniciando testes de conexão com Supabase...\n")

  const results = {
    connection: await testSupabaseConnection(),
    tables: await testTablesExist(),
    insert: await testInsertData(),
    query: await testQueryData(),
    realtime: await testRealTimeFeatures(),
  }

  console.log("\n📊 RESUMO DOS TESTES:")
  console.log(`   Conexão básica: ${results.connection ? "✅" : "❌"}`)
  console.log(`   Tabelas existem: ${results.tables ? "✅" : "❌"}`)
  console.log(`   Inserção de dados: ${results.insert ? "✅" : "❌"}`)
  console.log(`   Consulta de dados: ${results.query ? "✅" : "❌"}`)
  console.log(`   Recursos em tempo real: ${results.realtime ? "✅" : "❌"}`)

  const allPassed = Object.values(results).every((result) => result === true)

  if (allPassed) {
    console.log("\n🎉 TODOS OS TESTES PASSARAM! Supabase está funcionando corretamente.")
  } else {
    console.log("\n⚠️ ALGUNS TESTES FALHARAM. Verifique a configuração do Supabase.")
  }

  return allPassed
}

// Executar todos os testes
runAllSupabaseTests()
