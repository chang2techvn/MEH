import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.userAvatar || "/placeholder.svg"} alt={activity.userName} />
                <AvatarFallback>{activity.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.userName}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const recentActivities = [
  {
    userName: "Sarah Johnson",
    userAvatar: "/placeholder.svg?height=36&width=36",
    action: "Completed challenge: Advanced Grammar Quiz",
    time: "10 minutes ago",
  },
  {
    userName: "Michael Chen",
    userAvatar: "/placeholder.svg?height=36&width=36",
    action: "Submitted a new speaking practice recording",
    time: "25 minutes ago",
  },
  {
    userName: "Emma Wilson",
    userAvatar: "/placeholder.svg?height=36&width=36",
    action: "Joined the platform",
    time: "1 hour ago",
  },
  {
    userName: "David Kim",
    userAvatar: "/placeholder.svg?height=36&width=36",
    action: "Earned badge: Conversation Master",
    time: "2 hours ago",
  },
  {
    userName: "Sophia Martinez",
    userAvatar: "/placeholder.svg?height=36&width=36",
    action: "Posted in community forum: 'Tips for IELTS Speaking'",
    time: "3 hours ago",
  },
]
