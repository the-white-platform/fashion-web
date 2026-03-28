import { Skeleton } from '@/components/ui/skeleton'
import { PageContainer } from '@/components/layout/PageContainer'

export default function ProductDetailLoading() {
  return (
    <PageContainer>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-sm" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-sm" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-10 h-10 rounded-sm" />
                ))}
              </div>
            </div>
            <Skeleton className="h-14 w-full rounded-sm" />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
