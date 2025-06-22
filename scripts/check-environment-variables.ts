/**
 * Script para verificar se todas as variáveis de ambiente estão configuradas
 */

console.log("🔍 Verificando variáveis de ambiente...")

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
]

const optionalEnvVars = ["SUPABASE_JWT_SECRET", "NEXT_PUBLIC_SITE_URL"]

console.log("\n📋 VARIÁVEIS OBRIGATÓRIAS:")
requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar]
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${envVar}: NÃO CONFIGURADA`)
  }
})

console.log("\n📋 VARIÁVEIS OPCIONAIS:")
optionalEnvVars.forEach((envVar) => {
  const value = process.env[envVar]
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`⚠️ ${envVar}: Não configurada`)
  }
})

const missingRequired = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingRequired.length > 0) {
  console.log(`\n❌ VARIÁVEIS OBRIGATÓRIAS FALTANDO: ${missingRequired.join(", ")}`)
  console.log("\n📝 Para configurar:")
  console.log("1. Copie o arquivo .env.example para .env.local")
  console.log("2. Preencha as variáveis com os valores do seu projeto Supabase")
  console.log("3. Reinicie o servidor de desenvolvimento")
} else {
  console.log("\n✅ TODAS AS VARIÁVEIS OBRIGATÓRIAS ESTÃO CONFIGURADAS!")
}
