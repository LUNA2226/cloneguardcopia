import { type NextRequest, NextResponse } from "next/server"

// Cria o cliente Supabase apenas se as variáveis de ambiente estiverem disponíveis
let supabase: any = null
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require("@supabase/supabase-js")
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
  }
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Get parameters from URL
    const { searchParams } = new URL(request.url)
    const originalDomain = searchParams.get("d") || ""
    const cloneDomain = searchParams.get("c") || ""

    // Log to console for debugging
    console.log(`Clone detected: ${cloneDomain} cloned ${originalDomain}`)

    // Log to Supabase if available
    if (supabase) {
      try {
        // Try to find the domain
        const { data: domainData } = await supabase
          .from("domains")
          .select("id, client_id")
          .eq("domain_name", originalDomain)
          .single()

        if (domainData) {
          // Log the clone attempt
          await supabase.from("clone_attempts").insert({
            domain_id: domainData.id,
            client_id: domainData.client_id,
            clone_url: `https://${cloneDomain}`,
            original_domain: originalDomain,
            user_agent: request.headers.get("user-agent") || "",
            ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
            detected_at: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Error logging to Supabase:", error)
      }
    }

    // Return a 1x1 transparent GIF
    return new NextResponse(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"), {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error in log-clone:", error)
    // Still return a valid image even on error
    return new NextResponse(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"), {
      headers: { "Content-Type": "image/gif" },
    })
  }
}
