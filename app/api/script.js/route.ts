import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientApiKey = searchParams.get("data-key")
    const authorizedDomain = searchParams.get("data-domain")

    // Get current hostname from referrer or other headers
    const referer = request.headers.get("referer")
    const currentHostname = referer ? new URL(referer).hostname : null

    if (!clientApiKey || !authorizedDomain) {
      return new NextResponse("/* Missing required parameters */", {
        status: 400,
        headers: { "Content-Type": "application/javascript" },
      })
    }

    // If running on the authorized domain, do nothing (not a clone)
    if (currentHostname === authorizedDomain) {
      return new NextResponse("/* Running on authorized domain - no action needed */", {
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

    // Generate the minimal client script that will load the protection payload
    const clientScript = `
(function() {
  try {
    const currentHost = window.location.hostname;
    const authorizedHost = "${authorizedDomain}";
    
    // Only run protection if this is NOT the authorized domain
    if (currentHost !== authorizedHost) {
      const script = document.createElement('script');
      const apiUrl = "${process.env.NEXT_PUBLIC_SITE_URL || "https://app.cloneguardpro.com"}/api/pp";
      const params = new URLSearchParams({
        h: currentHost,
        k: "${clientApiKey}",
        p: window.location.pathname
      });
      
      script.src = apiUrl + '?' + params.toString();
      script.async = true;
      script.onerror = function() {
        console.warn('CloneGuard: Protection script failed to load');
      };
      
      document.head.appendChild(script);
    }
  } catch (e) {
    console.warn('CloneGuard: Error initializing protection', e);
  }
})();
`.trim()

    return new NextResponse(clientScript, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Error in script.js API:", error)
    return new NextResponse("/* CloneGuard: Script error */", {
      status: 500,
      headers: { "Content-Type": "application/javascript" },
    })
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
