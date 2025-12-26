import * as React from "react"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
  glow?: boolean
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  glow = false,
}: MetricCardProps) {
  return (
    <Card className={cn("metric-card", glow && "glow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-primary" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.value > 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StatsBarProps {
  stats: Array<{
    label: string
    value: string | number
    icon?: LucideIcon
  }>
  className?: string
}

export function StatsBar({ stats, className }: StatsBarProps) {
  return (
    <div className={cn("flex items-center space-x-6 px-4 py-2 glass", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center space-x-2">
          {stat.icon && (
            <stat.icon className="h-4 w-4 text-primary" />
          )}
          <span className="text-sm text-muted-foreground">
            {stat.label}:
          </span>
          <span className="text-sm font-medium text-foreground">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}