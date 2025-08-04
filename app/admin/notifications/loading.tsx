import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function NotificationsLoading() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-2 mb-6">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-[400px] rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[180px] rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recipient Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>

              <div className="space-y-2 border rounded-md p-4 h-[300px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-[120px] mb-1" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Skeleton className="h-5 w-[150px]" />
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  <div className="grid gap-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle and Right Columns - Message Composition */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-[150px]" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-[100px] rounded-md" />
                <Skeleton className="h-8 w-[180px] rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-[200px] mt-1" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-10 rounded-md" />
                <Skeleton className="h-10 rounded-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-[200px] w-full" />
              </div>

              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-4 w-[120px]" />
              </div>

              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[120px]" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
