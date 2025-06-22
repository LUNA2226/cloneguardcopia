import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { domain, days = 7, format = "json" } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Generate report data
    const reportData = await generateDomainReport(domain, days)

    if (format === "pdf") {
      // Generate PDF report (you'd implement PDF generation here)
      return NextResponse.json({
        message: "PDF generation not implemented yet",
        reportData,
      })
    }

    if (format === "csv") {
      // Generate CSV report
      const csv = generateCSVReport(reportData)

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="clone-report-${domain}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Default JSON format
    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

async function generateDomainReport(domain: string, days: number) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: visits, error } = await supabase
    .from("clone_visits")
    .select("*")
    .eq("dominio_original", domain)
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString())
    .order("timestamp", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch visits for ${domain}: ${error.message}`)
  }

  // Process analytics data (same as in cron job)
  const totalVisits = visits?.length || 0
  const uniqueCloneDomains = new Set(visits?.map((v) => v.dominio_clonado) || [])

  const dailyVisits =
    visits?.reduce(
      (acc, visit) => {
        const date = new Date(visit.timestamp).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const cloneDomainCounts =
    visits?.reduce(
      (acc, visit) => {
        acc[visit.dominio_clonado] = (acc[visit.dominio_clonado] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const topCloneDomains = Object.entries(cloneDomainCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return {
    domain,
    period: {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
      days,
    },
    summary: {
      totalVisits,
      uniqueCloneDomains: uniqueCloneDomains.size,
      avgDailyVisits: Math.round(totalVisits / days),
    },
    dailyVisits,
    topCloneDomains,
    visits: visits || [],
  }
}

function generateCSVReport(reportData: any) {
  const { visits } = reportData

  const headers = ["Date", "Time", "Original Domain", "Clone Domain", "URL"]
  const rows = visits.map((visit: any) => [
    new Date(visit.timestamp).toISOString().split("T")[0],
    new Date(visit.timestamp).toTimeString().split(" ")[0],
    visit.dominio_original,
    visit.dominio_clonado,
    visit.url,
  ])

  const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.map((field) => `"${field}"`).join(","))].join(
    "\n",
  )

  return csvContent
}
