import { Suspense } from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, BarChart, LineChart } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUpRight,
  Download,
  Users,
  Clock,
  BookOpen,
  Calendar,
  Filter,
  RefreshCw,
  Printer,
  Share2,
  HelpCircle,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Engagement Analytics | EnglishMastery Admin",
  description: "Track and analyze user engagement metrics across the EnglishMastery platform",
}

// Simulated data - in a real app, this would come from an API
const engagementData = {
  overview: {
    activeUsers: {
      value: 2847,
      change: 12.5,
      period: "week",
    },
    averageSessionTime: {
      value: "18:24",
      change: 3.2,
      period: "week",
    },
    completionRate: {
      value: 78.3,
      change: 5.1,
      period: "week",
    },
    returnRate: {
      value: 64.7,
      change: -2.3,
      period: "week",
    },
  },
  charts: {
    dailyActiveUsers: [
      { date: "Mon", users: 1420 },
      { date: "Tue", users: 1620 },
      { date: "Wed", users: 1780 },
      { date: "Thu", users: 1500 },
      { date: "Fri", users: 1700 },
      { date: "Sat", users: 1300 },
      { date: "Sun", users: 1200 },
    ],
    contentEngagement: [
      { type: "Videos", completion: 82 },
      { type: "Quizzes", completion: 76 },
      { type: "Reading", completion: 65 },
      { type: "Challenges", completion: 89 },
      { type: "Community", completion: 71 },
    ],
    retentionCohorts: [
      { week: "Week 1", retention: 100 },
      { week: "Week 2", retention: 86 },
      { week: "Week 3", retention: 72 },
      { week: "Week 4", retention: 65 },
      { week: "Week 5", retention: 58 },
      { week: "Week 6", retention: 52 },
      { week: "Week 7", retention: 48 },
      { week: "Week 8", retention: 45 },
    ],
    timeOfDay: [
      { hour: "00:00", users: 120 },
      { hour: "03:00", users: 80 },
      { hour: "06:00", users: 140 },
      { hour: "09:00", users: 580 },
      { hour: "12:00", users: 620 },
      { hour: "15:00", users: 750 },
      { hour: "18:00", users: 890 },
      { hour: "21:00", users: 450 },
    ],
  },
  topContent: [
    { id: 1, title: "Business English Essentials", views: 1245, completion: 87, avgTime: "12:34" },
    { id: 2, title: "IELTS Speaking Practice", views: 1120, completion: 92, avgTime: "18:22" },
    { id: 3, title: "Everyday Conversation Skills", views: 980, completion: 79, avgTime: "09:45" },
    { id: 4, title: "Grammar Masterclass", views: 870, completion: 68, avgTime: "15:10" },
    { id: 5, title: "Pronunciation Workshop", views: 760, completion: 81, avgTime: "11:55" },
  ],
  userSegments: [
    { segment: "Beginners", percentage: 35, growth: 8.2 },
    { segment: "Intermediate", percentage: 42, growth: 5.7 },
    { segment: "Advanced", percentage: 23, growth: 3.1 },
  ],
}

function EngagementOverviewCard({ title, value, change, icon: Icon }: {
  title: string
  value: string | number
  change: string | number
  icon: React.ComponentType<any>
}) {
  const isPositive = typeof change === 'number' ? change >= 0 : parseFloat(change.toString()) >= 0

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1 text-xs">
          <span className={`flex items-center ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
            {isPositive ? "+" : ""}
            {change}%
            <ArrowUpRight className={`w-3 h-3 ml-1 ${!isPositive && "rotate-180"}`} />
          </span>
          <span className="ml-1 text-muted-foreground">vs last week</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <div className="w-full p-6 space-y-2">
      <Skeleton className="w-1/4 h-4" />
      <Skeleton className="w-full h-[200px]" />
    </div>
  )
}

function EngagementDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagement Analytics</h1>
          <p className="text-muted-foreground">Track and analyze how users engage with your content and platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EngagementOverviewCard
          title="Active Users"
          value={engagementData.overview.activeUsers.value.toLocaleString()}
          change={engagementData.overview.activeUsers.change}
          icon={Users}
        />
        <EngagementOverviewCard
          title="Avg. Session Time"
          value={engagementData.overview.averageSessionTime.value}
          change={engagementData.overview.averageSessionTime.change}
          icon={Clock}
        />
        <EngagementOverviewCard
          title="Completion Rate"
          value={`${engagementData.overview.completionRate.value}%`}
          change={engagementData.overview.completionRate.change}
          icon={BookOpen}
        />
        <EngagementOverviewCard
          title="Return Rate"
          value={`${engagementData.overview.returnRate.value}%`}
          change={engagementData.overview.returnRate.change}
          icon={Calendar}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="retention"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Retention
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Select defaultValue="7days">
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24hours">Last 24 hours</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daily Active Users</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>User activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <AreaChart
                    data={engagementData.charts.dailyActiveUsers}
                    index="date"
                    categories={["users"]}
                    colors={["#10b981"]}
                    valueFormatter={(value) => `${value.toLocaleString()} users`}
                    className="h-[300px]"
                  />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Engagement</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Completion rates by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <BarChart
                    data={engagementData.charts.contentEngagement}
                    index="type"
                    categories={["completion"]}
                    colors={["#8b5cf6"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-[300px]"
                  />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Retention</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Cohort Analysis
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Weekly retention rates for new users</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <LineChart
                    data={engagementData.charts.retentionCohorts}
                    index="week"
                    categories={["retention"]}
                    colors={["#f43f5e"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-[300px]"
                  />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Activity by Time of Day</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>When users are most active</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <AreaChart
                    data={engagementData.charts.timeOfDay}
                    index="hour"
                    categories={["users"]}
                    colors={["#0ea5e9"]}
                    valueFormatter={(value) => `${value} users`}
                    className="h-[300px]"
                  />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performing Content</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
              <CardDescription>Content with highest engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full pr-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Title</th>
                      <th className="pb-2 text-right font-medium">Views</th>
                      <th className="pb-2 text-right font-medium">Completion</th>
                      <th className="pb-2 text-right font-medium">Avg. Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagementData.topContent.map((item) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3">{item.title}</td>
                        <td className="py-3 text-right">{item.views.toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                              item.completion >= 80
                                ? "bg-emerald-100 text-emerald-800"
                                : item.completion >= 70
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {item.completion}%
                          </span>
                        </td>
                        <td className="py-3 text-right">{item.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Content Type Distribution</CardTitle>
                <CardDescription>Breakdown of content by type and usage</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full max-w-md">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: "Video Lessons", percentage: 42, color: "bg-blue-500" },
                      { type: "Interactive Quizzes", percentage: 28, color: "bg-purple-500" },
                      { type: "Reading Materials", percentage: 18, color: "bg-pink-500" },
                      { type: "Practice Exercises", percentage: 12, color: "bg-yellow-500" },
                    ].map((item) => (
                      <div key={item.type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.type}</span>
                          <span className="font-medium">{item.percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all duration-1000 ease-in-out`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Engagement by Device</CardTitle>
                <CardDescription>How users access your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[250px]">
                  <div className="grid grid-cols-3 gap-8 w-full max-w-md">
                    {[
                      { device: "Mobile", percentage: 58, icon: "📱" },
                      { device: "Desktop", percentage: 32, icon: "💻" },
                      { device: "Tablet", percentage: 10, icon: "📟" },
                    ].map((item) => (
                      <div key={item.device} className="flex flex-col items-center justify-center text-center">
                        <div className="text-4xl mb-2">{item.icon}</div>
                        <div className="text-2xl font-bold">{item.percentage}%</div>
                        <div className="text-sm text-muted-foreground">{item.device}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Distribution of users by proficiency level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {engagementData.userSegments.map((segment) => (
                    <div key={segment.segment} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{segment.segment}</span>
                        <div className="flex items-center">
                          <span>{segment.percentage}%</span>
                          <span
                            className={`ml-2 text-xs ${segment.growth >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                          >
                            {segment.growth >= 0 ? "+" : ""}
                            {segment.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${
                            segment.segment === "Beginners"
                              ? "bg-emerald-500"
                              : segment.segment === "Intermediate"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                          } transition-all duration-1000 ease-in-out`}
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Where your users are located</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { country: "United States", users: 28, flag: "🇺🇸" },
                    { country: "India", users: 17, flag: "🇮🇳" },
                    { country: "Brazil", users: 14, flag: "🇧🇷" },
                    { country: "Japan", users: 9, flag: "🇯🇵" },
                    { country: "Germany", users: 7, flag: "🇩🇪" },
                    { country: "Other", users: 25, flag: "🌍" },
                  ].map((item) => (
                    <div key={item.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.flag}</span>
                        <span>{item.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-1000 ease-in-out"
                            style={{ width: `${item.users}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.users}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle>User Activity Patterns</CardTitle>
              <CardDescription>When and how users engage with the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-medium">Weekly Activity</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <div key={day} className="text-center space-y-2">
                        <div className="text-xs text-muted-foreground">{day}</div>
                        <div
                          className="mx-auto w-8 h-16 rounded-md bg-primary/10 overflow-hidden"
                          style={{
                            position: "relative",
                            background: `linear-gradient(to top, var(--primary) ${[60, 75, 85, 65, 70, 45, 40][i]}%, transparent ${[60, 75, 85, 65, 70, 45, 40][i]}%)`,
                          }}
                        />
                        <div className="text-xs font-medium">{[60, 75, 85, 65, 70, 45, 40][i]}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">User Behavior</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Complete lessons in one sitting", value: 68 },
                      { label: "Return to complete lessons", value: 42 },
                      { label: "Participate in community", value: 37 },
                      { label: "Submit practice exercises", value: 58 },
                      { label: "Use mobile app", value: 73 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000 ease-in-out"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Retention Curve</CardTitle>
                <CardDescription>User retention over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <LineChart
                    data={[
                      { day: "Day 1", retention: 100 },
                      { day: "Day 3", retention: 82 },
                      { day: "Day 7", retention: 68 },
                      { day: "Day 14", retention: 56 },
                      { day: "Day 30", retention: 48 },
                      { day: "Day 60", retention: 42 },
                      { day: "Day 90", retention: 38 },
                    ]}
                    index="day"
                    categories={["retention"]}
                    colors={["#10b981"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-[300px]"
                  />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Churn Analysis</CardTitle>
                <CardDescription>Reasons users stop engaging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { reason: "Completed learning goals", percentage: 32 },
                    { reason: "Found content too difficult", percentage: 24 },
                    { reason: "Lack of time", percentage: 18 },
                    { reason: "Technical issues", percentage: 12 },
                    { reason: "Switched to competitor", percentage: 8 },
                    { reason: "Other reasons", percentage: 6 },
                  ].map((item) => (
                    <div key={item.reason} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.reason}</span>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-rose-500 transition-all duration-1000 ease-in-out"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle>Re-engagement Strategies</CardTitle>
              <CardDescription>Effectiveness of re-engagement campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    strategy: "Email Reminders",
                    success: 42,
                    icon: "📧",
                    description: "Weekly digest of new content and progress reminders",
                  },
                  {
                    strategy: "Special Offers",
                    success: 58,
                    icon: "🎁",
                    description: "Limited-time access to premium content",
                  },
                  {
                    strategy: "Personalized Content",
                    success: 67,
                    icon: "🎯",
                    description: "AI-recommended lessons based on user interests",
                  },
                ].map((item) => (
                  <Card key={item.strategy} className="border-none shadow-none bg-muted/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <CardTitle className="text-base">{item.strategy}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-1000 ease-in-out"
                            style={{ width: `${item.success}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.success}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Success rate</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function EngagementAnalyticsPage() {
  return (
    <div className="container py-6 space-y-6 max-w-7xl">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-28" />
                    </CardContent>
                  </Card>
                ))}
            </div>
            <div>
              <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
          </div>
        }
      >
        <EngagementDashboard />
      </Suspense>
    </div>
  )
}
