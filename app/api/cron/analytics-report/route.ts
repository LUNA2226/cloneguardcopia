import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Resend } from "resend"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const resend = new Resend(process.env.RESEND_API_KEY!)

export const dynamic = "force-dynamic"

// This endpoint will be called by Vercel Cron Jobs
export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Starting periodic analytics report generation...")

    // Get all unique domains that have been cloned
    const { data: domains, error: domainsError } = await supabase
      .from("clone_visits")
      .select("dominio_original")
      .order("dominio_original")

    if (domainsError) {
      console.error("Error fetching domains:", domainsError)
      return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 })
    }

    const uniqueDomains = [...new Set(domains?.map((d) => d.dominio_original) || [])]

    if (uniqueDomains.length === 0) {
      console.log("No domains found with clone activity")
      return NextResponse.json({ message: "No domains to report on" })
    }

    // Generate reports for each domain
    const reportPromises = uniqueDomains.map(async (domain) => {
      try {
        // Generate report for this domain
        const reportData = await generateDomainReport(domain)

        // Send email report
        await sendEmailReport(domain, reportData)

        return { domain, status: "success" }
      } catch (error) {
        console.error(`Error generating report for ${domain}:`, error)
        return { domain, status: "error", error: error.message }
      }
    })

    const results = await Promise.allSettled(reportPromises)
    const successCount = results.filter((r) => r.status === "fulfilled" && r.value.status === "success").length
    const errorCount = results.length - successCount

    console.log(`Analytics reports completed: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      message: "Analytics reports generated",
      totalDomains: uniqueDomains.length,
      successCount,
      errorCount,
      results: results.map((r) => (r.status === "fulfilled" ? r.value : { status: "error" })),
    })
  } catch (error) {
    console.error("Error in analytics report cron:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateDomainReport(domain: string) {
  // Get data for the last 7 days
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

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

  // Process analytics data
  const totalVisits = visits?.length || 0

  // Unique clone domains
  const uniqueCloneDomains = new Set(visits?.map((v) => v.dominio_clonado) || [])

  // Daily breakdown
  const dailyVisits =
    visits?.reduce(
      (acc, visit) => {
        const date = new Date(visit.timestamp).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Top clone domains
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
    .slice(0, 5)

  // Most accessed URLs
  const urlCounts =
    visits?.reduce(
      (acc, visit) => {
        acc[visit.url] = (acc[visit.url] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const topUrls = Object.entries(urlCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return {
    domain,
    period: {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    },
    summary: {
      totalVisits,
      uniqueCloneDomains: uniqueCloneDomains.size,
      avgDailyVisits: Math.round(totalVisits / 7),
    },
    dailyVisits,
    topCloneDomains,
    topUrls,
    recentVisits: visits?.slice(0, 10) || [],
  }
}

async function sendEmailReport(domain: string, reportData: any) {
  try {
    const emailContent = generateEmailTemplate(reportData)

    // Get admin email for this domain (you might want to store this in your database)
    // For now, using a default pattern - adjust based on your user management system
    const adminEmail = `admin@${domain}`

    const { data, error } = await resend.emails.send({
      from: "CloneGuard Reports <reports@cloneguard.com>",
      to: [adminEmail],
      subject: `🛡️ CloneGuard Weekly Report - ${domain}`,
      html: emailContent,
    })

    if (error) {
      console.error(`Failed to send email for ${domain}:`, error)
      throw new Error(`Email sending failed: ${error.message}`)
    }

    console.log(`Email report sent successfully for ${domain}:`, data?.id)
    return data
  } catch (error) {
    console.error(`Error sending email for ${domain}:`, error)
    throw error
  }
}

function generateEmailTemplate(reportData: any) {
  const { domain, period, summary, dailyVisits, topCloneDomains, topUrls } = reportData

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CloneGuard Weekly Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 25px 0; }
        .metric-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; transition: all 0.2s; }
        .metric-card:hover { border-color: #0891b2; transform: translateY(-2px); }
        .metric-value { font-size: 2.5em; font-weight: 800; color: #0891b2; margin: 0; }
        .metric-label { color: #64748b; font-size: 0.9em; margin-top: 5px; font-weight: 500; }
        .alert { background: #fef2f2; border-left: 4px solid #dc2626; color: #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .success { background: #f0fdf4; border-left: 4px solid #16a34a; color: #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .warning { background: #fffbeb; border-left: 4px solid #d97706; color: #d97706; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .section { margin: 30px 0; }
        .section h3 { color: #1e293b; font-size: 1.3em; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
        .table th { background: #f1f5f9; padding: 15px 12px; text-align: left; font-weight: 600; color: #374151; }
        .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .table tr:last-child td { border-bottom: none; }
        .table tr:hover { background: #f9fafb; }
        .footer { text-align: center; margin-top: 40px; padding: 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; transition: background 0.2s; }
        .btn:hover { background: #0e7490; }
        .badge { background: #dc2626; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: 600; }
        .url-cell { word-break: break-all; max-width: 300px; font-family: monospace; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ CloneGuard Weekly Report</h1>
            <p>Protection Summary for <strong>${domain}</strong></p>
            <p>${period.start} to ${period.end}</p>
        </div>

        <div class="content">
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${summary.totalVisits}</div>
                    <div class="metric-label">Clone Visits Blocked</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.uniqueCloneDomains}</div>
                    <div class="metric-label">Malicious Domains</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.avgDailyVisits}</div>
                    <div class="metric-label">Avg Daily Blocks</div>
                </div>
            </div>

            ${
              summary.totalVisits > 100
                ? `
            <div class="alert">
                <strong>🚨 High Clone Activity Alert!</strong><br>
                Your site experienced <span class="badge">${summary.totalVisits}</span> clone visits this week. This is significantly above normal levels. Consider reviewing your protection settings and monitoring for new threats.
            </div>
            `
                : summary.totalVisits > 20
                  ? `
            <div class="warning">
                <strong>⚠️ Moderate Clone Activity</strong><br>
                ${summary.totalVisits} clone visits detected this week. Your protection is working, but stay vigilant for emerging threats.
            </div>
            `
                  : summary.totalVisits === 0
                    ? `
            <div class="success">
                <strong>✅ Perfect Protection</strong><br>
                Excellent! No clone visits were detected this week. Your CloneGuard protection is working flawlessly.
            </div>
            `
                    : `
            <div class="success">
                <strong>✅ Low Activity</strong><br>
                Only ${summary.totalVisits} clone visits detected. Your protection is effectively deterring threats.
            </div>
            `
            }

            ${
              topCloneDomains.length > 0
                ? `
            <div class="section">
                <h3>🎯 Top Threat Domains</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Malicious Domain</th>
                            <th>Blocked Visits</th>
                            <th>Threat Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topCloneDomains
                          .map(
                            ([domain, count]) => `
                        <tr>
                            <td style="font-family: monospace;">${domain}</td>
                            <td><strong>${count}</strong></td>
                            <td>${
                              count > 20
                                ? '<span style="color: #dc2626;">🔴 High</span>'
                                : count > 5
                                  ? '<span style="color: #d97706;">🟡 Medium</span>'
                                  : '<span style="color: #16a34a;">🟢 Low</span>'
                            }</td>
                        </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
            `
                : ""
            }

            ${
              topUrls.length > 0
                ? `
            <div class="section">
                <h3>📊 Most Targeted Pages</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Cloned URL</th>
                            <th>Visits</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topUrls
                          .map(
                            ([url, count]) => `
                        <tr>
                            <td class="url-cell">${url}</td>
                            <td><strong>${count}</strong></td>
                        </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
            `
                : ""
            }

            <div class="section">
                <h3>📈 Daily Protection Activity</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Blocked Visits</th>
                            <th>Activity Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(dailyVisits)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .map(
                            ([date, count]) => `
                        <tr>
                            <td>${new Date(date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}</td>
                            <td><strong>${count}</strong></td>
                            <td>${
                              count > 20
                                ? '<span style="color: #dc2626;">High</span>'
                                : count > 5
                                  ? '<span style="color: #d97706;">Medium</span>'
                                  : count > 0
                                    ? '<span style="color: #16a34a;">Low</span>'
                                    : '<span style="color: #64748b;">None</span>'
                            }</td>
                        </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <p><strong>This report was automatically generated by CloneGuard</strong></p>
            <p>Stay protected with real-time clone detection and automated threat response.</p>
            <a href="https://your-cloneguard-dashboard.com/analytics" class="btn">📊 View Full Dashboard</a>
            <a href="https://your-cloneguard-dashboard.com/settings" class="btn">⚙️ Update Settings</a>
            <p style="margin-top: 30px; color: #64748b; font-size: 0.9em;">
                Need help? Contact our support team or visit our documentation.
            </p>
        </div>
    </div>
</body>
</html>
  `
}
