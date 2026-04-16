import type { GlobalConfig } from 'payload'

import { revalidateFooter } from './hooks/revalidateFooter'

/**
 * Footer global — intentionally empty (fields: []).
 *
 * The storefront's <FooterClient /> renders a fixed layout with four
 * columns: brand + socials, a Products column driven by the Categories
 * collection, a hardcoded customer-service column, and a hardcoded
 * contact column. None of it reads from this global.
 *
 * The global is kept as a lightweight placeholder so the admin sidebar
 * doesn't lose the slug and so revalidateFooter still has a trigger to
 * hook onto when the footer ever becomes CMS-editable.
 */
export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Footer is currently rendered from hardcoded layout + the Categories collection. No fields to configure here.',
  },
  fields: [],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
