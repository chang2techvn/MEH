import { Skeleton } from "@/components/ui/skeleton"

export default function MessagesLoading() {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="flex h-full rounded-lg overflow-hidden border shadow-lg">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex md:w-1/3 lg:w-1/4 flex-col border-r bg-card">
          <div className="p-4 border-b">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] ${i % 2 === 0 ? "mr-auto" : "ml-auto"}`}>
                      <Skeleton className={`h-20 w-full rounded-2xl`} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 border-t">
            <Skeleton className="h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
