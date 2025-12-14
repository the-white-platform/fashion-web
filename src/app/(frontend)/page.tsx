import PageTemplate, { generateMetadata } from './[slug]/page'

// During Docker build, database may not be available - make dynamic
export const dynamic = 'force-dynamic'

export default PageTemplate

export { generateMetadata }
