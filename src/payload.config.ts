import { gcsStorage } from '@payloadcms/storage-gcs'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { LoyaltyAccounts } from './collections/LoyaltyAccounts'
import { LoyaltyTransactions } from './collections/LoyaltyTransactions'
import { Referrals } from './collections/Referrals'
import { ChatConversations } from './collections/ChatConversations'
import { ChatMessages } from './collections/ChatMessages'
import { Media } from './collections/Media'
import { Coupons } from './collections/Coupons'
import { Notifications } from './collections/Notifications'
import { NotificationPreferences } from './collections/NotificationPreferences'
import { PushSubscriptions } from './collections/PushSubscriptions'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { NewsletterCampaigns } from './collections/NewsletterCampaigns'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Reviews } from './collections/Reviews'
import { SizeCharts } from './collections/SizeCharts'
import { StockMovements } from './collections/StockMovements'
import { Users } from './collections/Users'
import { VtoGenerations } from './collections/VtoGenerations'
import { Provinces, Districts, Wards } from './collections/VietnamAddresses'
import { seedHandler } from './endpoints/seedHandler'
import { bulkOrderStatusHandler } from './endpoints/bulkOrderStatus'
import { exportCsvHandler } from './endpoints/exportCsv'
import { sendNewsletterHandler } from './endpoints/sendNewsletter'
import { newsletterUnsubscribeHandler } from './endpoints/newsletterUnsubscribe'
import { Footer } from './components/layout/Footer/config'
import { Header } from './components/layout/Header/config'
import { Homepage } from './globals/Homepage'
import { PaymentMethods } from './globals/PaymentMethods'
import { ChatContext } from './globals/ChatContext'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { migrations } from './migrations'

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
      beforeLogin: ['@/admin/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/admin/BeforeDashboard'],
      afterNavLinks: [
        '@/admin/AccountingLink',
        '@/admin/InventoryAlertsLink',
        '@/admin/BulkOrderStatusLink',
        '@/admin/NotificationBell',
        '@/admin/ChatDashboardLink',
      ],
      views: {
        Accounting: {
          Component: '@/admin/AccountingView',
          path: '/accounting',
        },
        InventoryAlerts: {
          Component: '@/admin/InventoryAlerts',
          path: '/inventory-alerts',
        },
        BulkOrders: {
          Component: '@/admin/BulkOrderStatus',
          path: '/bulk-orders',
        },
        ChatDashboard: {
          Component: '@/admin/ChatDashboard',
          path: '/chat-dashboard',
        },
      },
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
    // Run migrations automatically on startup in production
    prodMigrations: migrations,
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Products,
    Reviews,
    Orders,
    Coupons,
    SizeCharts,
    StockMovements,
    Provinces,
    Districts,
    Wards,
    Notifications,
    NotificationPreferences,
    PushSubscriptions,
    NewsletterSubscribers,
    NewsletterCampaigns,
    ChatConversations,
    ChatMessages,
    LoyaltyAccounts,
    LoyaltyTransactions,
    Referrals,
    VtoGenerations,
  ],
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || ''].filter(Boolean),
  endpoints: [
    // The seed endpoint is used to populate the database with some example data
    // You should delete this endpoint before deploying your site to production
    {
      handler: seedHandler,
      method: 'get',
      path: '/seed',
    },
    {
      handler: bulkOrderStatusHandler,
      method: 'post',
      path: '/bulk-order-status',
    },
    {
      handler: exportCsvHandler,
      method: 'get',
      path: '/export-csv',
    },
    {
      handler: sendNewsletterHandler,
      method: 'post',
      path: '/send-newsletter',
    },
    {
      handler: newsletterUnsubscribeHandler,
      method: 'post',
      path: '/newsletter-subscribers/unsubscribe',
    },
  ],
  globals: [Header, Footer, Homepage, PaymentMethods, ChatContext],
  plugins: [
    ...plugins,
    // GCS object storage for Payload uploads. Enabled when PAYLOAD_MEDIA_BUCKET
    // is set (prod Cloud Run); in local dev the env var is empty so the
    // adapter falls through and Payload keeps using each collection's staticDir
    // (src/collections/Media.ts → public/media, SizeCharts → public/size-charts).
    ...(process.env.PAYLOAD_MEDIA_BUCKET
      ? [
          gcsStorage({
            bucket: process.env.PAYLOAD_MEDIA_BUCKET,
            collections: {
              media: true,
              'size-charts': true,
            },
            // On Cloud Run the service account is auto-detected via ADC.
            // Locally, GOOGLE_APPLICATION_CREDENTIALS points at a JSON key if
            // you want to test GCS uploads from your laptop.
            options: {
              projectId: process.env.GCP_PROJECT_ID,
            },
          }),
        ]
      : []),
  ],
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY ?? '',
    defaultFromAddress: 'noreply@thewhite.vn',
    defaultFromName: 'The White',
  }),
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
