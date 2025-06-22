import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import JavaScriptObfuscator from "javascript-obfuscator"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentHostname = searchParams.get("h")
    const clientApiKey = searchParams.get("k")

    if (!currentHostname || !clientApiKey) {
      return new NextResponse("/* Missing params */", {
        status: 400,
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Fetch configuration from database
    const { data: config, error } = await supabase
      .from("domain_configs")
      .select("*")
      .eq("client_api_key", clientApiKey)
      .single()

    if (error || !config) {
      return new NextResponse("/* Config not found */", {
        status: 404,
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // If somehow running on authorized domain, do nothing
    if (currentHostname === config.authorized_domain) {
      return new NextResponse("/* Authorized domain */", {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Track the clone visit (async, don't wait)
    fetch(`${request.nextUrl.origin}/api/track-clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dominioOriginal: config.authorized_domain,
        dominioClonado: currentHostname,
        url: `https://${currentHostname}${searchParams.get("p") || "/"}`,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {}) // Silent fail for tracking

    const p = config.protections || {}
    let js = ""

    // Build compact protection payload
    if (p.autoRedirect) {
      js += `location.href='https://${config.original_site_domain}';`
    } else {
      // Only apply other protections if not redirecting
      if (p.visualInterference) {
        js += `document.body.style.cssText+='filter:blur(2px)!important;animation:s .5s infinite!important;';`
        js += `document.head.insertAdjacentHTML('beforeend','<style>@keyframes s{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}</style>');`
        js += `document.body.insertAdjacentHTML('afterbegin','<div style="position:fixed;top:0;left:0;width:100%;background:red;color:white;text-align:center;z-index:99999;padding:10px;font-weight:bold;">⚠️ SITE CLONADO DETECTADO</div>');`
      }

      if (p.replaceImages && config.replacement_image_url) {
        js += `document.querySelectorAll('img').forEach(i=>{i.src='${config.replacement_image_url}';i.srcset='';});`
      }

      if (p.fixCheckoutLinks && config.original_checkout_url) {
        js += `document.querySelectorAll('a').forEach(l=>{if(/checkout|buy|comprar|finalizar/i.test(l.href))l.href='${config.original_checkout_url}';});`
      }

      if (p.redirectLinks) {
        js += `document.querySelectorAll('a').forEach(l=>{try{const u=new URL(l.href);u.hostname='${config.original_site_domain}';l.href=u.toString();}catch(e){}});`
      }
    }

    if (!js) js = "/* No protections active */"

    // Light obfuscation for payload
    const obfuscated = JavaScriptObfuscator.obfuscate(js, {
      compact: true,
      identifierNamesGenerator: "mangled",
      simplify: true,
      stringArray: false,
      controlFlowFlattening: false,
    })

    return new NextResponse(obfuscated.getObfuscatedCode(), {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error in protection payload API:", error)
    return new NextResponse("/* Error */", {
      status: 500,
      headers: { "Content-Type": "application/javascript" },
    })
  }
}
