import { type NextRequest, NextResponse } from "next/server"

// Importação segura do cliente Supabase
let supabase: any
let resend: any

try {
  const { createClient } = require("@supabase/supabase-js")
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
} catch (error) {
  console.error("Error creating Supabase client:", error)
}

try {
  const { Resend } = require("resend")
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
} catch (error) {
  console.error("Error creating Resend client:", error)
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Extrair parâmetros da URL
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("k")
    const currentHost = decodeURIComponent(searchParams.get("h") || "")

    // Validar API key
    if (!apiKey) {
      return new NextResponse("", {
        status: 200,
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Variáveis para armazenar dados do domínio e configurações
    let authorizedDomain = ""
    let domainId = ""
    let clientId = ""
    let clientEmail = ""
    let checkoutUrl = ""
    let replacementImageUrl = ""
    let settings = {
      auto_redirect: false,
      visual_interference: true,
      replace_images: true,
      fix_checkout_links: true,
      redirect_links: true,
      email_alerts: false,
    }

    // Buscar dados no Supabase se disponível
    if (supabase) {
      try {
        const { data: domain, error: domainError } = await supabase
          .from("domains")
          .select(`
            id,
            domain_name,
            client_id,
            checkout_url,
            replacement_image_url,
            clients (
              id,
              email,
              name
            ),
            user_protection_settings (*)
          `)
          .eq("api_key", apiKey)
          .single()

        if (!domainError && domain) {
          authorizedDomain = domain.domain_name
          domainId = domain.id
          clientId = domain.client_id
          checkoutUrl = domain.checkout_url || `https://${domain.domain_name}/checkout`
          replacementImageUrl = domain.replacement_image_url || "/placeholder.svg?height=200&width=200"
          clientEmail = domain.clients?.email

          if (domain.user_protection_settings?.[0]) {
            settings = {
              ...settings,
              ...domain.user_protection_settings[0],
            }
          }

          // Registrar tentativa de acesso se não estiver no domínio autorizado
          if (currentHost !== authorizedDomain) {
            try {
              await supabase.from("clone_attempts").insert({
                domain_id: domainId,
                client_id: clientId,
                clone_url: `https://${currentHost}`,
                original_domain: authorizedDomain,
                user_agent: request.headers.get("user-agent") || "",
                ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
                detected_at: new Date().toISOString(),
              })
            } catch (logError) {
              console.error("Error logging clone attempt:", logError)
            }
          }
        }
      } catch (supabaseError) {
        console.error("Error fetching domain data:", supabaseError)
      }
    }

    // Se estiver no domínio autorizado ou não tiver domínio autorizado, não fazer nada
    if (currentHost === authorizedDomain || !authorizedDomain) {
      return new NextResponse("", {
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // Gerar script de proteção baseado nas configurações
    let protectionScript = ""

    // Redirecionamento automático
    if (settings.auto_redirect) {
      protectionScript += `(function(){window.location.href='https://${authorizedDomain}';})();`
    } else {
      // Interferência visual
      if (settings.visual_interference) {
        protectionScript += `
          (function(){
            var d=document;
            var b=d.body;
            if(!b)return;
            b.style.filter='blur(3px)';
            b.style.animation='a 0.5s infinite';
            var s=d.createElement('style');
            s.textContent='@keyframes a{0%,100%{transform:translateX(0)}50%{transform:translateX(10px)}}';
            d.head.appendChild(s);
            var w=d.createElement('div');
            w.innerHTML='⚠️';
            w.style.cssText='position:fixed;top:0;left:0;width:100%;background:#f00;color:#fff;text-align:center;z-index:999999;padding:15px;font-weight:bold;font-size:18px;';
            b.insertBefore(w,b.firstChild);
          })();
        `
      }

      // Substituir imagens
      if (settings.replace_images) {
        protectionScript += `
          (function(){
            var i=document.querySelectorAll('img');
            for(var j=0;j<i.length;j++){
              i[j].src='${replacementImageUrl}';
              i[j].srcset='';
            }
          })();
        `
      }

      // Corrigir links de checkout
      if (settings.fix_checkout_links && checkoutUrl) {
        protectionScript += `
          (function(){
            var a=document.querySelectorAll('a');
            var r=/checkout|buy|comprar|finalizar|pagar|payment/i;
            for(var i=0;i<a.length;i++){
              if(r.test(a[i].href)){
                a[i].href='${checkoutUrl}';
              }
            }
          })();
        `
      }

      // Redirecionamento de links
      if (settings.redirect_links && authorizedDomain) {
        protectionScript += `
          (function(){
            var a=document.querySelectorAll('a');
            for(var i=0;i<a.length;i++){
              try{
                var u=new URL(a[i].href);
                if(u.hostname!=='${authorizedDomain}'){
                  u.hostname='${authorizedDomain}';
                  a[i].href=u.toString();
                }
              }catch(e){}
            }
          })();
        `
      }
    }

    // Enviar alerta por email se configurado
    if (settings.email_alerts && clientEmail && resend) {
      try {
        resend.emails
          .send({
            from: "CloneGuard <alerts@cloneguard.app>",
            to: [clientEmail],
            subject: `Alerta: Clone detectado em ${currentHost}`,
            html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f00;">⚠️ Clone Detectado</h2>
            <p>Detectamos um possível clone do seu site:</p>
            <ul>
              <li><strong>Domínio Original:</strong> ${authorizedDomain}</li>
              <li><strong>Clone Detectado:</strong> ${currentHost}</li>
              <li><strong>Data/Hora:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>As proteções configuradas foram ativadas automaticamente.</p>
          </div>
        `,
          })
          .catch((err: any) => console.error("Error sending email:", err))
      } catch (emailError) {
        console.error("Error sending alert email:", emailError)
      }
    }

    // Retornar script de proteção minificado
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
    return new NextResponse("", {
      status: 200,
      headers: { "Content-Type": "application/javascript" },
    })
  }
}
