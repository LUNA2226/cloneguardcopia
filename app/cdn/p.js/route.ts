import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Get parameters from URL
    const { searchParams } = new URL(request.url)
    const originalDomain = searchParams.get("d") || ""
    const currentHost = searchParams.get("h") || ""

    // If we're on the original domain, do nothing
    if (currentHost === originalDomain) {
      return new NextResponse("", {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Simple protection script
    const protectionScript = `
      (function(){
        // Visual interference
        var d=document;
        var b=d.body;
        if(!b) {
          d.addEventListener('DOMContentLoaded', function() {
            applyProtection();
          });
        } else {
          applyProtection();
        }
        
        function applyProtection() {
          var b=document.body;
          
          // Add warning banner
          var w=d.createElement('div');
          w.innerHTML='⚠️ ATENÇÃO: Este site é uma cópia não autorizada!';
          w.style.cssText='position:fixed;top:0;left:0;width:100%;background:#f00;color:#fff;text-align:center;z-index:999999;padding:15px;font-weight:bold;font-size:18px;';
          b.insertBefore(w,b.firstChild);
          
          // Apply visual effects
          b.style.filter='blur(3px)';
          var s=d.createElement('style');
          s.textContent='@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}body{animation:shake 0.5s infinite;}';
          d.head.appendChild(s);
          
          // Replace images
          var imgs=d.querySelectorAll('img');
          for(var i=0;i<imgs.length;i++){
            imgs[i].src='/placeholder.svg?height=200&width=200';
            imgs[i].srcset='';
          }
          
          // Fix checkout links
          var links=d.querySelectorAll('a');
          var checkoutRegex=/checkout|comprar|pagar|finalizar|carrinho|cart/i;
          for(var j=0;j<links.length;j++){
            if(checkoutRegex.test(links[j].href)){
              links[j].href='https://${originalDomain}/checkout';
            }
          }
        }
        
        // Log the clone attempt (image beacon to avoid CORS)
        var img = new Image();
        img.src = '/api/log-clone?d=${encodeURIComponent(originalDomain)}&c=${encodeURIComponent(currentHost)}&t=${Date.now()}';
      })();
    `

    return new NextResponse(protectionScript, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error in protection script:", error)
    return new NextResponse("console.log('Error loading protection');", {
      headers: { "Content-Type": "application/javascript" },
    })
  }
}
