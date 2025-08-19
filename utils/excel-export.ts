export interface ExportableUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  lastActivity: string
  location?: string
  level?: string
}

export const exportToExcel = async (users: ExportableUser[], filename: string = 'users.xlsx'): Promise<void> => {
  
  // Convert to CSV as a simple alternative
  const csvContent = convertToCSV(users)
  downloadCSV(csvContent, filename.replace('.xlsx', '.csv'))
}

const convertToCSV = (users: ExportableUser[]): string => {
  const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Join Date', 'Last Activity', 'Location', 'Level']
  const rows = users.map(user => [
    user.id,
    user.name,
    user.email,
    user.role,
    user.status,
    user.joinDate,
    user.lastActivity,
    user.location || '',
    user.level || ''
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
