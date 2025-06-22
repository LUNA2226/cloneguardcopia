import { type NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

export const dynamic = "force-dynamic"

// Função para decodificar o ID seguro e obter o domínio original
async function getOriginalDomain(secureId: string): Promise<string | null> {
  // Em produção, isso buscaria do banco de dados
  // Para demonstração, vamos usar uma lógica simplificada

  // Domínios de teste
  const testDomains = ["minhapagina.com.br", "ofertaespecial.com", "cursoonline.net"]

  // Tenta encontrar o domínio que corresponde ao ID seguro
  for (const domain of testDomains) {
    const hash = createHash("sha256").update(domain).digest("hex").substring(0, 12)
    const encoded = Buffer.from(domain).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

    const generatedId = `${hash}${encoded.substring(0, 8)}`

    if (generatedId === secureId) {
      return domain
    }
  }

  return null
}

export async function GET(request: NextRequest, { params }: { params: { scriptPath: string } }) {
  try {
    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url)
    const secureId = searchParams.get("i") || ""
    const currentHost = searchParams.get("h") || ""

    // Obtém o domínio original a partir do ID seguro
    const originalDomain = await getOriginalDomain(secureId)

    if (!originalDomain) {
      // Retorna um script vazio se o domínio não for encontrado
      return new NextResponse("console.log('Resource not found');", {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Verifica se estamos no domínio original
    if (currentHost === originalDomain) {
      // No domínio original, não faz nada
      return new NextResponse("/* Valid origin */", {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Gera um script de proteção altamente ofuscado
    // Observe que não incluímos o domínio original diretamente no código
    const protectionScript = `
    (function(){
      // Função para decodificar strings
      function d(s){return atob(s.replace(/-/g,'+').replace(/_/g,'/'))}
      
      // Dados codificados (não contém o domínio em texto claro)
      var c='${Buffer.from(
        JSON.stringify({
          id: secureId,
          ts: Date.now(),
          ref: request.headers.get("referer") || "unknown",
        }),
      ).toString("base64")}';
      
      // Inicializa proteção
      var _p=function(){
        var doc=document;
        var bod=doc.body;
        
        // Função para aplicar proteções
        function ap(){
          // Adiciona banner de aviso
          var w=doc.createElement('div');
          w.innerHTML='⚠️ ATENÇÃO: Este site não é o original!';
          w.style.cssText='position:fixed;top:0;left:0;width:100%;background:#f00;color:#fff;text-align:center;z-index:999999;padding:15px;font-weight:bold;font-size:18px;';
          bod.insertBefore(w,bod.firstChild);
          
          // Aplica efeitos visuais
          bod.style.filter='blur(3px)';
          var s=doc.createElement('style');
          s.textContent='@keyframes sk{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}body{animation:sk 0.5s infinite;}';
          doc.head.appendChild(s);
          
          // Substitui imagens
          var imgs=doc.querySelectorAll('img');
          for(var i=0;i<imgs.length;i++){
            imgs[i].src='/placeholder.svg?height=200&width=200';
            imgs[i].srcset='';
          }
          
          // Corrige links
          var links=doc.querySelectorAll('a');
          var checkoutRegex=/checkout|comprar|pagar|finalizar|carrinho|cart/i;
          for(var j=0;j<links.length;j++){
            if(checkoutRegex.test(links[j].href)){
              // Usa uma função para gerar o URL correto sem expor o domínio
              links[j].href=getSecureUrl();
              links[j].setAttribute('target','_blank');
            }
          }
          
          // Rastreia cliques
          doc.addEventListener('click',function(e){
            logEvent('click',{
              x:e.clientX,
              y:e.clientY,
              target:e.target.tagName,
              time:new Date().getTime()
            });
          });
          
          // Rastreia tempo na página
          var st=new Date().getTime();
          setInterval(function(){
            logEvent('time',{
              duration:new Date().getTime()-st
            });
          },30000);
        }
        
        // Função para gerar URL seguro sem expor o domínio
        function getSecureUrl(){
          // Usa um endpoint seguro que fará o redirecionamento
          return '/api/r?i=${secureId}&t='+new Date().getTime();
        }
        
        // Função para registrar eventos
        function logEvent(type,data){
          var img=new Image();
          img.src='/api/e?t='+type+'&d='+encodeURIComponent(JSON.stringify(data))+'&i=${secureId}&h='+encodeURIComponent(location.hostname);
        }
        
        // Aplica proteções quando o DOM estiver pronto
        if(bod){
          ap();
        }else{
          doc.addEventListener('DOMContentLoaded',ap);
        }
        
        // Registra visualização
        var img=new Image();
        img.src='/api/v?i=${secureId}&h='+encodeURIComponent(location.hostname)+'&t='+new Date().getTime();
      };
      
      // Executa com atraso para dificultar detecção
      setTimeout(_p,50);
    })();
    `

    // Retorna o script de proteção
    return new NextResponse(protectionScript, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error in protection script:", error)
    return new NextResponse("console.log('Error loading resource');", {
      headers: { "Content-Type": "application/javascript" },
    })
  }
}
