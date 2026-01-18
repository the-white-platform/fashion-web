// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { seedHandler } from './endpoints/seedHandler'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { Homepage } from './globals/Homepage'
import { PaymentMethods } from './globals/PaymentMethods'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// SECURITY CHECK: Ensure we are not using the default secret in production
if (
  process.env.NODE_ENV === 'production' &&
  process.env.PAYLOAD_SECRET === 'your-secret-key-change-in-production'
) {
  throw new Error(
    'FATAL: Production environment detected with insecure default PAYLOAD_SECRET. You MUST change this value.',
  )
}

export default buildConfig({
  localization: {
    locales: [
      {
        label: 'Vietnamese',
        code: 'vi',
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'vi',
    fallback: true,
  },
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Auto-push schema changes in dev environment
    // In production, use migrations instead
    push: process.env.PAYLOAD_PUSH_SCHEMA === 'true',
  }),
  collections: [Pages, Posts, Media, Categories, Users, Products, Orders],
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || ''].filter(Boolean),
  endpoints: [
    // The seed endpoint is used to populate the database with some example data
    // You should delete this endpoint before deploying your site to production
    {
      handler: seedHandler,
      method: 'get',
      path: '/seed',
    },
  ],
  globals: [Header, Footer, Homepage, PaymentMethods],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
