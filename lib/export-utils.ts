export interface ExportableUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  level: string
  joinDate: string
  lastActivity: string
  completedChallenges: number
  totalChallenges: number
  location?: string
}

export function exportToExcel(data: ExportableUser[], filename: string) {
  // Convert data to CSV format
  const headers = [
    'ID',
    'Name', 
    'Email',
    'Role',
    'Status',
    'Level',
    'Join Date',
    'Last Activity',
    'Completed Challenges',
    'Total Challenges',
    'Location'
  ]

  const csvContent = [
    headers.join(','),
    ...data.map(user => [
      user.id,
      `"${user.name}"`,
      user.email,
      user.role,
      user.status,
      user.level,
      user.joinDate,
      user.lastActivity,
      user.completedChallenges,
      user.totalChallenges,
      `"${user.location || ''}"`
    ].join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
