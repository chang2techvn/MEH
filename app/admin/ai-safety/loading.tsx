import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function AISafetyLoading() {
  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[450px]" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[300px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <Skeleton className="h-8 w-[60px]" />
                  <Skeleton className="h-6 w-[40px]" />
                </div>
                <Skeleton className="h-2 w-full mt-2" />
                <Skeleton className="h-4 w-[80px] mt-2" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-5 w-[100px]" />
                        <Skeleton className="h-4 w-[150px] mt-1" />
                      </div>
                      <Skeleton className="h-6 w-[60px]" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-full mt-1" />
                    <div className="mt-2 flex justify-between items-center">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-6 w-[80px]" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-[150px]" />
                      <Skeleton className="h-6 w-[40px]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-[30px]" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
