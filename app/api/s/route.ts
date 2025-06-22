import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Função simplificada para decodificar o ID
function getOriginalDomain(secureId: string): string | null {
  try {
    // Em produção, isso buscaria do banco de dados
    // Para demonstração, vamos usar uma lógica simplificada
    const testDomains = ["minhapagina.com.br", "ofertaespecial.com", "cursoonline.net"]

    for (const domain of testDomains) {
      const encoded = Buffer.from(domain).toString("base64").replace(/=/g, "")
      if (encoded.substring(0, 16) === secureId) {
        return domain
      }
    }

    return null
  } catch (error) {
    console.error("Error decoding domain:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extrai parâmetros da URL
    const { searchParams } = new URL(request.url)
    const secureId = searchParams.get("i") || ""
    const currentHost = searchParams.get("h") || ""

    // Obtém o domínio original a partir do ID seguro
    const originalDomain = getOriginalDomain(secureId)

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

    // Gera um script de proteção simplificado
    const protectionScript = `
    (function(){
      // Inicializa proteção
      function initProtection(){
        var doc = document;
        var body = doc.body;
        
        // Função para aplicar proteções
        function applyProtections(){
          // Adiciona banner de aviso
          var warning = doc.createElement('div');
          warning.innerHTML = '⚠️ ATENÇÃO: Este site não é o original!';
          warning.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:#f00;color:#fff;text-align:center;z-index:999999;padding:15px;font-weight:bold;font-size:18px;';
          body.insertBefore(warning, body.firstChild);
          
          // Aplica efeitos visuais
          body.style.filter = 'blur(3px)';
          var style = doc.createElement('style');
          style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}body{animation:shake 0.5s infinite;}';
          doc.head.appendChild(style);
          
          // Substitui imagens
          var images = doc.querySelectorAll('img');
          for(var i=0; i<images.length; i++){
            images[i].src = '/placeholder.svg?height=200&width=200';
            images[i].srcset = '';
          }
          
          // Corrige links
          var links = doc.querySelectorAll('a');
          var checkoutRegex = /checkout|comprar|pagar|finalizar|carrinho|cart/i;
          for(var j=0; j<links.length; j++){
            if(checkoutRegex.test(links[j].href)){
              links[j].href = '/api/r?i=${secureId}';
              links[j].setAttribute('target', '_blank');
            }
          }
          
          // Rastreia cliques
          doc.addEventListener('click', function(e){
            logEvent('click', {
              x: e.clientX,
              y: e.clientY,
              target: e.target.tagName
            });
          });
          
          // Rastreia tempo na página
          var startTime = new Date().getTime();
          setInterval(function(){
            logEvent('time', {
              duration: new Date().getTime() - startTime
            });
          }, 30000);
        }
        
        // Função para registrar eventos
        function logEvent(type, data){
          var img = new Image();
          img.src = '/api/e?t=' + type + '&d=' + encodeURIComponent(JSON.stringify(data)) + '&i=${secureId}&h=' + encodeURIComponent(location.hostname);
        }
        
        // Aplica proteções quando o DOM estiver pronto
        if(body){
          applyProtections();
        } else {
          doc.addEventListener('DOMContentLoaded', applyProtections);
        }
        
        // Registra visualização
        var img = new Image();
        img.src = '/api/v?i=${secureId}&h=' + encodeURIComponent(location.hostname);
      }
      
      // Executa com atraso para dificultar detecção
      setTimeout(initProtection, 50);
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
