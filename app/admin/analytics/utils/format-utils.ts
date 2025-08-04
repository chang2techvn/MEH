import { format, subDays, subMonths } from "date-fns"

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const getTrendColor = (trend: string): string => {
  return trend === "up" ? "text-green-500" : "text-red-500"
}

export const formatDateRange = (range: string): string => {
  const today = new Date()

  switch (range) {
    case "today":
      return format(today, "MMMM d, yyyy")
    case "yesterday":
      return format(subDays(today, 1), "MMMM d, yyyy")
    case "last7days":
      return `${format(subDays(today, 6), "MMM d")} - ${format(today, "MMM d, yyyy")}`
    case "last30days":
      return `${format(subDays(today, 29), "MMM d")} - ${format(today, "MMM d, yyyy")}`
    case "thisMonth":
      return format(today, "MMMM yyyy")
    case "lastMonth":
      return format(subMonths(today, 1), "MMMM yyyy")
    case "thisYear":
      return format(today, "yyyy")
    default:
      return "Custom Range"
  }
}
