"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Shield, AlertTriangle, Clock, Globe, RefreshCw, Eye } from "lucide-react"

interface AnalyticsData {
  visits: any[]
  analytics: {
    totalVisits: number
    recentVisits: number
    visitsByDay: { date: string; count: number }[]
    topClonedDomains: { domain: string; count: number }[]
    topOriginalDomains: { domain: string; count: number }[]
    hourlyDistribution: { hour: number; count: number }[]
  }
  dateRange: {
    start: string
    end: string
    days: number
  }
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDays, setSelectedDays] = useState(30)
  const [selectedDomain, setSelectedDomain] = useState<string>("")

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        days: selectedDays.toString(),
      })

      if (selectedDomain) {
        params.append("domain", selectedDomain)
      }

      const response = await fetch(`/api/analytics/clone-visits?${params}`)
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        console.error("Failed to fetch analytics:", result.error)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedDays, selectedDomain])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const getMaxCount = (data: { count: number }[]) => {
    return Math.max(...data.map((d) => d.count), 1)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Clone Analytics</h1>
          <RefreshCw className="animate-spin h-6 w-6 text-cyan-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
        <p className="text-gray-400 mb-4">Unable to fetch clone visit data</p>
        <Button onClick={fetchAnalytics} className="bg-cyan-600 hover:bg-cyan-500">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clone Analytics</h1>
          <p className="text-gray-400 mt-1">Monitoring clone activity for the last {data.dateRange.days} days</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number.parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={fetchAnalytics} size="sm" className="bg-cyan-600 hover:bg-cyan-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Clone Visits</p>
                <h3 className="text-2xl font-bold">{data.analytics.totalVisits.toLocaleString()}</h3>
              </div>
              <Eye className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Last 24 Hours</p>
                <h3 className="text-2xl font-bold">{data.analytics.recentVisits.toLocaleString()}</h3>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unique Clone Domains</p>
                <h3 className="text-2xl font-bold">{data.analytics.topClonedDomains.length}</h3>
              </div>
              <Globe className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Protected Domains</p>
                <h3 className="text-2xl font-bold">{data.analytics.topOriginalDomains.length}</h3>
              </div>
              <Shield className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visits Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
              Daily Clone Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-1">
              {data.analytics.visitsByDay.map((day, index) => {
                const maxCount = getMaxCount(data.analytics.visitsByDay)
                const height = (day.count / maxCount) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-cyan-500 rounded-t transition-all duration-300 hover:bg-cyan-400"
                      style={{ height: `${height}%`, minHeight: day.count > 0 ? "4px" : "0px" }}
                      title={`${formatDate(day.date)}: ${day.count} visits`}
                    ></div>
                    <span className="text-xs text-gray-400 mt-1 transform rotate-45 origin-left">
                      {formatDate(day.date)}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-400" />
              Today's Hourly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-1">
              {data.analytics.hourlyDistribution.map((hour) => {
                const maxCount = getMaxCount(data.analytics.hourlyDistribution)
                const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0
                return (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-400"
                      style={{ height: `${height}%`, minHeight: hour.count > 0 ? "4px" : "0px" }}
                      title={`${hour.hour}:00 - ${hour.count} visits`}
                    ></div>
                    <span className="text-xs text-gray-400 mt-1">{hour.hour.toString().padStart(2, "0")}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cloned Domains */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
              Most Active Clone Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.analytics.topClonedDomains.slice(0, 8).map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-red-400 mr-3">#{index + 1}</span>
                    <span className="text-sm font-mono">{domain.domain}</span>
                  </div>
                  <span className="text-sm font-semibold">{domain.count} visits</span>
                </div>
              ))}
              {data.analytics.topClonedDomains.length === 0 && (
                <p className="text-gray-400 text-center py-4">No clone domains detected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Original Domains */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-cyan-400" />
              Most Targeted Original Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.analytics.topOriginalDomains.slice(0, 8).map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-cyan-400 mr-3">#{index + 1}</span>
                    <span className="text-sm font-mono">{domain.domain}</span>
                  </div>
                  <span className="text-sm font-semibold">{domain.count} visits</span>
                </div>
              ))}
              {data.analytics.topOriginalDomains.length === 0 && (
                <p className="text-gray-400 text-center py-4">No protected domains found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-yellow-400" />
            Recent Clone Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Timestamp</th>
                  <th className="text-left py-3 px-4">Original Domain</th>
                  <th className="text-left py-3 px-4">Clone Domain</th>
                  <th className="text-left py-3 px-4">URL</th>
                </tr>
              </thead>
              <tbody>
                {data.visits.slice(0, 10).map((visit, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-750">
                    <td className="py-3 px-4 text-gray-300">{new Date(visit.timestamp).toLocaleString("pt-BR")}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{visit.dominio_original}</td>
                    <td className="py-3 px-4 font-mono text-red-400">{visit.dominio_clonado}</td>
                    <td className="py-3 px-4 text-gray-300 truncate max-w-xs" title={visit.url}>
                      {visit.url}
                    </td>
                  </tr>
                ))}
                {data.visits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No clone visits recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
