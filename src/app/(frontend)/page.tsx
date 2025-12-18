import HomePageClient from './page.client'
import type { Metadata } from 'next'

// During Docker build, database may not be available - make dynamic
export const dynamic = 'force-dynamic'

// Always use the custom e-commerce home page
// The CMS home page is available via /home if needed
export default function HomePage() {
  return <HomePageClient />
}

export const metadata: Metadata = {
  title: 'TheWhite - Thời Trang Thể Thao Hiện Đại',
  description: 'Khám phá bộ sưu tập thời trang thể thao cao cấp từ TheWhite',
}
