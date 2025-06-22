import type { NextRequest } from "next/server"

// Redirecionar para o endpoint principal
export async function GET(request: NextRequest) {
  const checkRoute = await import("../v1/check/route")
  return checkRoute.GET(request)
}

export const dynamic = "force-dynamic"
