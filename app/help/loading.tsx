import { Skeleton } from "@/components/ui/skeleton"

export default function HelpLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-40 w-full h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
        <div className="container flex h-20 items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-10 rounded-full md:hidden" />
          <div className="hidden md:flex items-center gap-8">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Skeleton className="h-10 w-40 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="container py-12 md:py-16">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-3xl mb-6" />
        <Skeleton className="h-1 w-24 rounded-full" />
      </div>

      <div className="container py-8">
        <div className="max-w-3xl mx-auto mb-12">
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-12 w-full mb-8 rounded-lg" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-full">
                  <Skeleton className="h-64 w-full rounded-xl" />
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}
