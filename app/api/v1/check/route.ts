import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import JavaScriptObfuscator from "javascript-obfuscator"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostname = searchParams.get("h")
    const key = searchParams.get("k")
    const sessionId = searchParams.get("s")
    const checkId = searchParams.get("c")

    if (!hostname || !key) {
      return new NextResponse("", { status: 404 })
    }

    // Buscar configuração
    const { data: config, error } = await supabase.from("domain_configs").select("*").eq("client_api_key", key).single()

    if (error || !config) {
      return new NextResponse("", { status: 404 })
    }

    // Se for domínio autorizado, não fazer nada
    if (hostname === config.authorized_domain) {
      return new NextResponse("", {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Registrar visita de clone (async)
    fetch(`${request.nextUrl.origin}/api/track-clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dominioOriginal: config.authorized_domain,
        dominioClonado: hostname,
        url: `https://${hostname}${searchParams.get("p") || "/"}`,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})

    const p = config.protections || {}
    let payload = ""

    // Gerar payload ultra-compacto
    if (p.autoRedirect) {
      payload += `location.href='https://${config.original_site_domain}';`
    } else {
      if (p.visualInterference) {
        payload += `document.body.style.cssText+='filter:blur(2px)!important;animation:shake .5s infinite!important;';`
        payload += `document.head.insertAdjacentHTML('beforeend','<style>@keyframes shake{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}</style>');`
        payload += `document.body.insertAdjacentHTML('afterbegin','<div style="position:fixed;top:0;left:0;width:100%;background:red;color:white;text-align:center;z-index:99999;padding:10px;font-weight:bold;">⚠️ SITE CLONADO</div>');`
      }

      if (p.replaceImages && config.replacement_image_url) {
        payload += `document.querySelectorAll('img').forEach(i=>{i.src='${config.replacement_image_url}';i.srcset='';});`
      }

      if (p.fixCheckoutLinks && config.original_checkout_url) {
        payload += `document.querySelectorAll('a').forEach(l=>{if(/checkout|buy|comprar|finalizar/i.test(l.href))l.href='${config.original_checkout_url}';});`
      }

      if (p.redirectLinks) {
        payload += `document.querySelectorAll('a').forEach(l=>{try{const u=new URL(l.href);u.hostname='${config.original_site_domain}';l.href=u.toString();}catch(e){}});`
      }
    }

    if (!payload) {
      return new NextResponse("", {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Obfuscar payload extremamente
    const obfuscated = JavaScriptObfuscator.obfuscate(payload, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 2000,
      disableConsoleOutput: true,
      identifierNamesGenerator: "mangled",
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 3,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayEncoding: ["base64", "rc4"],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 3,
      stringArrayWrappersChainedCalls: true,
      stringArrayThreshold: 1,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
    })

    return new NextResponse(obfuscated.getObfuscatedCode(), {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    return new NextResponse("", {
      status: 500,
      headers: { "Content-Type": "application/javascript" },
    })
  }
}
