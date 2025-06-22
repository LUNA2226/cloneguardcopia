import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")
    const domain = searchParams.get("domain")

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Base query
    let query = supabase
      .from("clone_visits")
      .select("*")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", endDate.toISOString())

    // Filter by domain if specified
    if (domain) {
      query = query.eq("dominio_original", domain)
    }

    const { data: visits, error } = await query.order("timestamp", { ascending: false })

    if (error) {
      console.error("Error fetching clone visits:", error)
      return NextResponse.json({ error: "Failed to fetch clone visits" }, { status: 500 })
    }

    // Process data for analytics
    const analytics = processAnalyticsData(visits || [])

    return NextResponse.json({
      visits: visits || [],
      analytics,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    })
  } catch (error) {
    console.error("Error in analytics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processAnalyticsData(visits: any[]) {
  // Total visits
  const totalVisits = visits.length

  // Visits by day (last 30 days)
  const visitsByDay = visits.reduce(
    (acc, visit) => {
      const date = new Date(visit.timestamp).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Top cloned domains
  const clonedDomains = visits.reduce(
    (acc, visit) => {
      acc[visit.dominio_clonado] = (acc[visit.dominio_clonado] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Top original domains being cloned
  const originalDomains = visits.reduce(
    (acc, visit) => {
      acc[visit.dominio_original] = (acc[visit.dominio_original] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Recent activity (last 24 hours)
  const last24Hours = new Date()
  last24Hours.setHours(last24Hours.getHours() - 24)
  const recentVisits = visits.filter((visit) => new Date(visit.timestamp) > last24Hours).length

  // Hourly distribution for today
  const today = new Date().toISOString().split("T")[0]
  const todayVisits = visits.filter((visit) => visit.timestamp.startsWith(today))

  const hourlyDistribution = todayVisits.reduce(
    (acc, visit) => {
      const hour = new Date(visit.timestamp).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  return {
    totalVisits,
    recentVisits,
    visitsByDay: Object.entries(visitsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topClonedDomains: Object.entries(clonedDomains)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    topOriginalDomains: Object.entries(originalDomains)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyDistribution[hour] || 0,
    })),
  }
}
