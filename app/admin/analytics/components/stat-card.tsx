"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StatCardProps } from "../types"

export const StatCard = ({ title, value, trend, trendValue, description, icon, isLoading = false }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{value}</div>
              {trend && (
                <div
                  className={cn(
                    "flex items-center text-sm font-medium",
                    trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500",
                  )}
                >
                  {trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : trend === "down" ? (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  ) : null}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
