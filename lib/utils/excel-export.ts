import * as XLSX from "xlsx"

export interface ExportableUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  level: string
  joinDate: string
  lastActive: string
  completedChallenges: number
  totalChallenges: number
  location?: string
}

export const exportToExcel = (users: ExportableUser[], fileName = "users-export") => {
  // Convert users to worksheet format
  const worksheet = XLSX.utils.json_to_sheet(users)

  // Create workbook and add the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users")

  // Format columns for better readability
  const columnWidths = [
    { wch: 10 }, // id
    { wch: 20 }, // name
    { wch: 25 }, // email
    { wch: 10 }, // role
    { wch: 10 }, // status
    { wch: 12 }, // level
    { wch: 12 }, // joinDate
    { wch: 12 }, // lastActive
    { wch: 10 }, // completedChallenges
    { wch: 10 }, // totalChallenges
    { wch: 20 }, // location
  ]

  worksheet["!cols"] = columnWidths

  // Generate Excel file and trigger browser download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

  // Create a Blob from the buffer
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${fileName}-${new Date().toISOString().split("T")[0]}.xlsx`
  document.body.appendChild(link)
  link.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}
