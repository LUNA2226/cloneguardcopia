import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

// Importação segura da biblioteca de obfuscação
let obfuscate: any
try {
  const JavaScriptObfuscator = require("javascript-obfuscator")
  obfuscate = JavaScriptObfuscator.obfuscate
} catch (error) {
  console.error("Error importing javascript-obfuscator:", error)
  // Função fallback simples caso a biblioteca não esteja disponível
  obfuscate = (code: string) => ({ getObfuscatedCode: () => code })
}

// Importação segura do cliente Supabase
let supabase: any
try {
  const { createClient } = require("@supabase/supabase-js")
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
} catch (error) {
  console.error("Error creating Supabase client:", error)
}

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Parse request body safely
    let domain = ""
    try {
      const body = await request.json()
      domain = body.domain || ""
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          script: "// Error: Invalid request",
        },
        { status: 400 },
      )
    }

    if (!domain) {
      return NextResponse.json(
        {
          error: "Domain required",
          script: "// Error: Domain required",
        },
        { status: 400 },
      )
    }

    // Generate a unique API key for this domain
    const apiKey = randomBytes(8).toString("hex")

    // Simplified logic - skip Supabase if not available
    if (!supabase) {
      console.warn("Supabase client not available, using fallback mode")

      // Generate a simple script without Supabase
      const rawScript = `(function(){var d=document;var s=d.createElement('script');s.async=1;s.src='/cdn/m.js?k=${apiKey}&h='+encodeURIComponent(location.hostname);d.head.appendChild(s)})();`

      // Try to obfuscate the script
      let finalScript
      try {
        const obfuscationResult = obfuscate(rawScript, {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          disableConsoleOutput: true,
          identifierNamesGenerator: "hexadecimal",
          log: false,
          numbersToExpressions: false,
          renameGlobals: false,
          selfDefending: false,
          simplify: true,
          splitStrings: false,
          stringArray: true,
          stringArrayEncoding: [],
          stringArrayThreshold: 0.8,
          transformObjectKeys: false,
          unicodeEscapeSequence: false,
        })
        finalScript = `<script>${obfuscationResult.getObfuscatedCode()}</script>`
      } catch (error) {
        console.error("Error obfuscating script:", error)
        finalScript = `<script>${rawScript}</script>`
      }

      return NextResponse.json({
        script: finalScript,
        size: finalScript.length,
        domain: domain,
        api_key: apiKey,
        mode: "fallback",
      })
    }

    // If Supabase is available, try to use it
    try {
      // Check if domain exists
      let { data: domainData, error } = await supabase
        .from("domains")
        .select("id, api_key, client_id")
        .eq("domain_name", domain)
        .single()

      if (error || !domainData) {
        // Try to create domain with demo data
        try {
          // Find or create demo client
          let { data: client } = await supabase.from("clients").select("id").eq("email", "demo@example.com").single()

          if (!client) {
            const { data: newClient, error: clientError } = await supabase
              .from("clients")
              .insert({
                name: "Demo User",
                email: "demo@example.com",
                status: "active",
              })
              .select("id")
              .single()

            if (clientError) {
              throw new Error(`Failed to create client: ${clientError.message}`)
            }

            client = newClient
          }

          // Create domain
          const { data: newDomain, error: domainError } = await supabase
            .from("domains")
            .insert({
              domain_name: domain,
              client_id: client.id,
              api_key: apiKey,
              status: "active",
              checkout_url: `https://${domain}/checkout`,
            })
            .select("id, api_key, client_id")
            .single()

          if (domainError) {
            throw new Error(`Failed to create domain: ${domainError.message}`)
          }

          // Create default settings
          await supabase.from("user_protection_settings").insert({
            domain_id: newDomain.id,
            client_id: client.id,
            auto_redirect: false,
            visual_interference: true,
            replace_images: true,
            fix_checkout_links: true,
            redirect_links: true,
            email_alerts: true,
          })

          domainData = newDomain
        } catch (createError) {
          console.error("Error creating domain:", createError)
          // Fall back to simple mode if domain creation fails
          domainData = { api_key: apiKey }
        }
      }

      // Generate script
      const rawScript = `(function(){var d=document;var s=d.createElement('script');s.async=1;s.src='/cdn/m.js?k=${domainData.api_key || apiKey}&h='+encodeURIComponent(location.hostname);d.head.appendChild(s)})();`

      // Try to obfuscate the script
      let finalScript
      try {
        const obfuscationResult = obfuscate(rawScript, {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          disableConsoleOutput: true,
          identifierNamesGenerator: "hexadecimal",
          log: false,
          numbersToExpressions: false,
          renameGlobals: false,
          selfDefending: false,
          simplify: true,
          splitStrings: false,
          stringArray: true,
          stringArrayEncoding: [],
          stringArrayThreshold: 0.8,
          transformObjectKeys: false,
          unicodeEscapeSequence: false,
        })
        finalScript = `<script>${obfuscationResult.getObfuscatedCode()}</script>`
      } catch (error) {
        console.error("Error obfuscating script:", error)
        finalScript = `<script>${rawScript}</script>`
      }

      return NextResponse.json({
        script: finalScript,
        size: finalScript.length,
        domain_id: domainData.id,
        api_key: domainData.api_key || apiKey,
      })
    } catch (supabaseError) {
      console.error("Supabase error:", supabaseError)

      // Fallback to simple script if Supabase operations fail
      const rawScript = `(function(){var d=document;var s=d.createElement('script');s.async=1;s.src='/cdn/m.js?k=${apiKey}&h='+encodeURIComponent(location.hostname);d.head.appendChild(s)})();`
      const finalScript = `<script>${rawScript}</script>`

      return NextResponse.json({
        script: finalScript,
        size: finalScript.length,
        domain: domain,
        api_key: apiKey,
        mode: "error-fallback",
        error: "Database operation failed",
      })
    }
  } catch (error) {
    console.error("Error generating script:", error)

    // Ensure we always return valid JSON even on critical errors
    return NextResponse.json(
      {
        error: "Script generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        script: "// Error generating script",
        size: 0,
      },
      { status: 500 },
    )
  }
}
