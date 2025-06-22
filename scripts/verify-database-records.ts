/**
 * Script para verificar os registros no banco de dados
 * Este script verifica se os eventos de clone estão sendo registrados corretamente
 */

import { createClient } from "@supabase/supabase-js"

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Inicializa o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDatabaseRecords() {
  console.log("🔍 Verificando registros no banco de dados...")

  try {
    // Verificar tabela de tentativas de clone
    console.log("\n1️⃣ Verificando registros de tentativas de clone...")

    const { data: cloneAttempts, error: cloneError } = await supabase
      .from("clone_attempts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (cloneError) {
      throw new Error(`Erro ao consultar clone_attempts: ${cloneError.message}`)
    }

    if (cloneAttempts && cloneAttempts.length > 0) {
      console.log(`✅ Encontrados ${cloneAttempts.length} registros de tentativas de clone`)
      console.log("📊 Últimos registros:")
      cloneAttempts.slice(0, 3).forEach((attempt, index) => {
        console.log(
          `   ${index + 1}. Clone: ${attempt.clone_domain} | Original: ${attempt.original_domain} | Data: ${new Date(attempt.created_at).toLocaleString()}`,
        )
      })
    } else {
      console.warn("⚠️ Nenhum registro de tentativa de clone encontrado")
    }

    // Verificar tabela de eventos
    console.log("\n2️⃣ Verificando registros de eventos...")

    const { data: events, error: eventsError } = await supabase
      .from("clone_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (eventsError) {
      console.warn(`⚠️ Erro ao consultar clone_events: ${eventsError.message}`)
      console.warn("   A tabela clone_events pode não existir ainda")
    } else if (events && events.length > 0) {
      console.log(`✅ Encontrados ${events.length} registros de eventos`)
      console.log("📊 Últimos eventos:")
      events.slice(0, 3).forEach((event, index) => {
        console.log(
          `   ${index + 1}. Tipo: ${event.event_type} | Clone: ${event.clone_domain} | Data: ${new Date(event.created_at).toLocaleString()}`,
        )
      })
    } else {
      console.warn("⚠️ Nenhum registro de evento encontrado")
    }

    // Verificar tabela de domínios
    console.log("\n3️⃣ Verificando registros de domínios protegidos...")

    const { data: domains, error: domainsError } = await supabase.from("domains").select("*").limit(10)

    if (domainsError) {
      throw new Error(`Erro ao consultar domains: ${domainsError.message}`)
    }

    if (domains && domains.length > 0) {
      console.log(`✅ Encontrados ${domains.length} domínios protegidos`)
      console.log("📊 Domínios:")
      domains.forEach((domain, index) => {
        console.log(
          `   ${index + 1}. ${domain.domain} | Cliente: ${domain.client_id} | Status: ${domain.status || "Ativo"}`,
        )
      })
    } else {
      console.warn("⚠️ Nenhum domínio protegido encontrado")
    }

    // Verificar tabela de configurações de proteção
    console.log("\n4️⃣ Verificando configurações de proteção...")

    const { data: settings, error: settingsError } = await supabase
      .from("user_protection_settings")
      .select("*")
      .limit(10)

    if (settingsError) {
      console.warn(`⚠️ Erro ao consultar user_protection_settings: ${settingsError.message}`)
      console.warn("   A tabela user_protection_settings pode não existir ainda")
    } else if (settings && settings.length > 0) {
      console.log(`✅ Encontradas ${settings.length} configurações de proteção`)
      console.log("📊 Configurações:")
      settings.forEach((setting, index) => {
        console.log(
          `   ${index + 1}. Domínio ID: ${setting.domain_id} | Visual: ${setting.visual_interference ? "Sim" : "Não"} | Redirecionamento: ${setting.redirect ? "Sim" : "Não"}`,
        )
      })
    } else {
      console.warn("⚠️ Nenhuma configuração de proteção encontrada")
    }

    console.log("\n✨ Verificação concluída!")
  } catch (error) {
    console.error("❌ Erro durante a verificação:", error)
  }
}

// Executar a verificação
verifyDatabaseRecords()
