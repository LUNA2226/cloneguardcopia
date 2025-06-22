import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  try {
    const { email, domain } = await request.json()

    if (!email || !domain) {
      return NextResponse.json({ error: "Email and domain are required" }, { status: 400 })
    }

    // Generate sample report data for testing
    const sampleReportData = {
      domain,
      period: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
      summary: {
        totalVisits: 42,
        uniqueCloneDomains: 7,
        avgDailyVisits: 6,
      },
      dailyVisits: {
        "2025-05-26": 8,
        "2025-05-27": 12,
        "2025-05-28": 3,
        "2025-05-29": 15,
        "2025-05-30": 4,
        "2025-05-31": 0,
        "2025-06-01": 0,
      },
      topCloneDomains: [
        ["fake-store-clone.com", 18],
        ["malicious-copy.net", 12],
        ["phishing-site.org", 8],
        ["clone-attempt.info", 4],
      ],
      topUrls: [
        [`https://fake-store-clone.com/${domain}/checkout`, 15],
        [`https://malicious-copy.net/${domain}/products`, 12],
        [`https://phishing-site.org/${domain}/login`, 8],
        [`https://clone-attempt.info/${domain}/`, 7],
      ],
    }

    const emailContent = generateEmailTemplate(sampleReportData)

    const { data, error } = await resend.emails.send({
      from: "CloneGuard Reports <reports@cloneguard.com>",
      to: [email],
      subject: `🛡️ CloneGuard Test Report - ${domain}`,
      html: emailContent,
    })

    if (error) {
      console.error("Failed to send test email:", error)
      return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 })
    }

    return NextResponse.json({
      message: "Test email sent successfully",
      emailId: data?.id,
      recipient: email,
      domain,
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
    <title>CloneGuard Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .test-banner { background: #fffbeb; border: 2px solid #d97706; color: #d97706; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: 600; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 25px 0; }
        .metric-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
        .metric-value { font-size: 2.5em; font-weight: 800; color: #0891b2; margin: 0; }
        .metric-label { color: #64748b; font-size: 0.9em; margin-top: 5px; font-weight: 500; }
        .warning { background: #fffbeb; border-left: 4px solid #d97706; color: #d97706; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .section { margin: 30px 0; }
        .section h3 { color: #1e293b; font-size: 1.3em; margin-bottom: 15px; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
        .table th { background: #f1f5f9; padding: 15px 12px; text-align: left; font-weight: 600; color: #374151; }
        .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .table tr:last-child td { border-bottom: none; }
        .footer { text-align: center; margin-top: 40px; padding: 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ CloneGuard Test Report</h1>
            <p>Sample Protection Summary for <strong>${domain}</strong></p>
            <p>${period.start} to ${period.end}</p>
        </div>

        <div class="content">
            <div class="test-banner">
                🧪 This is a test email with sample data to verify your email configuration
            </div>

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

            <div class="warning">
                <strong>⚠️ Sample Data Notice</strong><br>
                This report contains simulated data for testing purposes. Real reports will show actual clone detection data from your protected domains.
            </div>

            <div class="section">
                <h3>🎯 Sample Threat Domains</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Malicious Domain</th>
                            <th>Blocked Visits</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topCloneDomains
                          .map(
                            ([domain, count]) => `
                        <tr>
                            <td style="font-family: monospace;">${domain}</td>
                            <td><strong>${count}</strong></td>
                        </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="footer">
            <p><strong>Email configuration test successful! 🎉</strong></p>
            <p>Your CloneGuard email reports are now properly configured.</p>
            <a href="#" class="btn">📊 View Dashboard</a>
        </div>
    </div>
</body>
</html>
  `
}
