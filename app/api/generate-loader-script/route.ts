import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = "force-dynamic"

const getClientApiKey = async (domain: string): Promise<string | null> => {
  try {
    const { data: existingConfig, error } = await supabase
      .from("domain_configs")
      .select("client_api_key")
      .eq("authorized_domain", domain)
      .single()

    if (existingConfig && !error) {
      return existingConfig.client_api_key
    }
    return null
  } catch (error) {
    console.error("Error fetching client API key:", error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { authorizedDomain } = body

    if (!authorizedDomain || typeof authorizedDomain !== "string") {
      return NextResponse.json({ error: "Bad Request", details: "authorizedDomain is required." }, { status: 400 })
    }

    const clientApiKey = await getClientApiKey(authorizedDomain)

    if (!clientApiKey) {
      return NextResponse.json(
        {
          error: "Domain Not Registered",
          details:
            "This domain is not registered in the protection system. Please add it to your protected domains first.",
        },
        { status: 404 },
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.cloneguardpro.com"

    // Generate the MINIMAL script tag that users copy to their site
    const minimalScript = `<script src="${baseUrl}/api/script.js?data-key=${clientApiKey}&data-domain=${authorizedDomain}" async></script>`

    return NextResponse.json({
      loaderScript: minimalScript,
      clientApiKeyForReference: clientApiKey,
      domainValidated: true,
      scriptUrl: `${baseUrl}/api/script.js`,
      instructions: {
        step1: "Copy the script tag above",
        step2: "Paste it in your website's <head> section",
        step3: "The script will automatically protect against clones",
        step4: "Update protection settings anytime in your dashboard - no need to change the script",
      },
    })
  } catch (error: any) {
    console.error("Error in /api/generate-loader-script:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || "Failed to generate loader script." },
      { status: 500 },
    )
  }
}
