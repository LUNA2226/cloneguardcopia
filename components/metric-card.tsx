import type React from "react"

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change?: string
  changeType?: "positive" | "negative"
  isActive?: boolean
}

export function MetricCard({ title, value, icon, change, changeType = "positive", isActive = false }: MetricCardProps) {
  return (
    <div className={`p-4 rounded-lg ${isActive ? "bg-cyan-900/30 border border-cyan-400/50" : "bg-gray-800"}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <div
              className={`flex items-center text-xs mt-1 ${
                changeType === "positive" ? "text-green-400" : "text-red-400"
              }`}
            >
              {changeType === "positive" ? "↑" : "↓"} {change}
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${isActive ? "bg-cyan-400/20 text-cyan-400" : "bg-gray-700 text-gray-300"}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
