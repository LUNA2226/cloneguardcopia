import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const k = searchParams.get("k") || "" // API key obfuscada
    const d = searchParams.get("d") || "" // domínio original
    const h = searchParams.get("h") || "" // hostname atual

    // Decodificar o domínio original
    const authorizedHost = decodeURIComponent(d)
    const currentHost = h

    // Se for o domínio autorizado, não fazer nada
    if (currentHost === authorizedHost) {
      return new NextResponse("", {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Gerar script de proteção
    const protectionScript = `
      // Script de proteção para ${authorizedHost}
      // Detectado acesso em ${currentHost}
      
      // Registrar tentativa (simulado)
      console.log("[Monitor] Detectado acesso não autorizado");
      
      // Interferência visual
      (function(){
        document.body.style.filter='blur(3px)';
        document.body.style.animation='shake 0.5s infinite';
        const style=document.createElement('style');
        style.textContent='@keyframes shake{0%,100%{transform:translateX(0)}50%{transform:translateX(10px)}}';
        document.head.appendChild(style);
        const warning=document.createElement('div');
        warning.innerHTML='⚠️ ACESSO NÃO AUTORIZADO';
        warning.style.cssText='position:fixed;top:0;left:0;width:100%;background:#ff0000;color:#fff;text-align:center;z-index:999999;padding:15px;font-weight:bold;font-size:18px;';
        document.body.insertBefore(warning,document.body.firstChild);
      })();
      
      // Substituir imagens
      document.querySelectorAll('img').forEach(img=>{
        img.src='/placeholder.svg?height=200&width=200';
        img.srcset='';
      });
      
      // Corrigir links de checkout
      document.querySelectorAll('a').forEach(link=>{
        if(/checkout|buy|comprar|finalizar|pagar|payment/i.test(link.href)){
          link.href='https://${authorizedHost}/checkout';
        }
      });
      
      // Redirecionamento de links
      document.querySelectorAll('a').forEach(link=>{
        try{
          const url=new URL(link.href);
          if(url.hostname!=='${authorizedHost}'){
            url.hostname='${authorizedHost}';
            link.href=url.toString();
          }
        }catch(e){}
      });
    `

    return new NextResponse(protectionScript, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error in protection script:", error)
    return new NextResponse(
      `console.error("Script error: ${error instanceof Error ? error.message : "Unknown error"}");`,
      {
        status: 200,
        headers: { "Content-Type": "application/javascript" },
      },
    )
  }
}
