import { Calendar, Award, BookOpen } from "lucide-react"

interface UserDetailsActivityProps {
  recentActivity: any[]
}

const getTimeSince = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

  let interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + " years ago"
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + " months ago"
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + " days ago"
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + " hours ago"
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago"
  }
  return Math.floor(seconds) + " seconds ago"
}

export const UserDetailsActivity = ({ recentActivity }: UserDetailsActivityProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-4 flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-neo-mint dark:text-purist-blue" />
          Recent Activity
        </h4>

        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="mr-4 mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 flex items-center justify-center text-neo-mint dark:text-purist-blue">
                    {activity.type === "challenge" ? (
                      <Award className="h-4 w-4" />
                    ) : activity.type === "lesson" ? (
                      <BookOpen className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">{getTimeSince(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">No recent activity found</p>
          </div>
        )}
      </div>
    </div>
  )
}
