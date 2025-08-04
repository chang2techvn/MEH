import { addDays, addWeeks, addMonths } from "date-fns"

export const getFutureDates = (baseDate: Date, recurring: string, count = 3) => {
  const dates = []
  let currentDate = new Date(baseDate)

  for (let i = 0; i < count; i++) {
    switch (recurring) {
      case "daily":
        currentDate = addDays(currentDate, 1)
        break
      case "weekly":
        currentDate = addWeeks(currentDate, 1)
        break
      case "monthly":
        currentDate = addMonths(currentDate, 1)
        break
      default:
        return [] // No recurring dates
    }
    dates.push(new Date(currentDate))
  }

  return dates
}
