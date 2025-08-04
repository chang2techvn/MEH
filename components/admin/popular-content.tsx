import { BarChart, BookOpen, MessageSquare, Video } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PopularContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Content</CardTitle>
        <CardDescription>Most engaged content this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {popularContent.map((content, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="rounded-md bg-muted p-2">
                {content.type === "video" && <Video className="h-4 w-4" />}
                {content.type === "challenge" && <BarChart className="h-4 w-4" />}
                {content.type === "resource" && <BookOpen className="h-4 w-4" />}
                {content.type === "discussion" && <MessageSquare className="h-4 w-4" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{content.title}</p>
                <p className="text-xs text-muted-foreground">
                  {content.type === "video" && "Video"}
                  {content.type === "challenge" && "Challenge"}
                  {content.type === "resource" && "Resource"}
                  {content.type === "discussion" && "Discussion"}
                  {" • "}
                  {content.engagementMetric}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const popularContent = [
  {
    type: "video",
    title: "Mastering English Pronunciation: Vowel Sounds",
    engagementMetric: "1,245 views",
  },
  {
    type: "challenge",
    title: "Weekly Writing Challenge: Describe Your Hometown",
    engagementMetric: "328 submissions",
  },
  {
    type: "resource",
    title: "Complete Guide to English Phrasal Verbs",
    engagementMetric: "892 downloads",
  },
  {
    type: "discussion",
    title: "How to Overcome Speaking Anxiety?",
    engagementMetric: "156 comments",
  },
  {
    type: "video",
    title: "Business English: Negotiation Techniques",
    engagementMetric: "764 views",
  },
]
