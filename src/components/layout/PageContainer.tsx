import { cn } from '@/utilities/cn'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('min-h-screen bg-background text-foreground pt-32 pb-12 relative', className)}>
      {children}
    </div>
  )
}
