# Spec 15: Newsletter Backend

## Summary

Persist email subscriptions, manage subscriber list in admin, send bulk newsletters via email service.

## Depends On

- Spec 13 (customer email — shares email service configuration)

## New Collection: `newsletter-subscribers`

### New File: `src/collections/NewsletterSubscribers.ts`

| Field | Type | Description |
|-------|------|-------------|
| `email` | email, unique, required | Subscriber email |
| `name` | text | Optional name |
| `status` | select | active, unsubscribed, bounced |
| `subscribedAt` | date | When they subscribed |
| `unsubscribedAt` | date | When they unsubscribed (if applicable) |
| `source` | select | footer_form, checkout, manual | Where they signed up |
| `unsubscribeToken` | text, unique | Random token for unsubscribe link |

**Admin config:**
- `useAsTitle`: email
- `defaultColumns`: email, status, source, subscribedAt
- `group`: { vi: 'Tiep thi', en: 'Marketing' }

**Access:**
- read: adminOrEditor
- create: anyone (public subscription endpoint)
- update: adminOrEditor
- delete: admin

## Subscription API

### Connect Existing Component: `src/components/ecommerce/Newsletter.tsx`

The existing newsletter form currently mocks submission. Wire it to:

`POST /api/newsletter-subscribers`

With data:
```json
{
  "email": "user@example.com",
  "source": "footer_form",
  "status": "active",
  "subscribedAt": "2026-03-29T00:00:00Z"
}
```

A `beforeChange` hook auto-generates `unsubscribeToken` on create.

## Unsubscribe Flow

### New File: `src/app/(frontend)/[locale]/unsubscribe/page.tsx`

- Accepts query param `?token=xxx`
- Calls API to find subscriber by token, set status to `unsubscribed`
- Shows confirmation page (localized vi/en)

## Newsletter Campaigns Collection

### New File: `src/collections/NewsletterCampaigns.ts`

| Field | Type | Description |
|-------|------|-------------|
| `subject` | text, required, localized | Email subject line |
| `content` | richText (Lexical), localized | Email body |
| `status` | select | draft, sending, sent, failed |
| `sentAt` | date | When campaign was sent |
| `recipientCount` | number, readOnly | How many emails sent |
| `targetAudience` | select | all_active, custom_segment |

**Admin config:**
- `useAsTitle`: subject
- `defaultColumns`: subject, status, recipientCount, sentAt
- `group`: { vi: 'Tiep thi', en: 'Marketing' }

**Access:** adminOrEditor for all operations.

## Send Campaign Endpoint

### New File: `src/endpoints/sendNewsletter.ts`

`POST /api/send-newsletter`

Request: `{ campaignId: number }`

Logic:
1. Verify user is admin/editor
2. Fetch campaign, verify status is `draft`
3. Set status to `sending`
4. Query all active subscribers
5. For each subscriber, send email via `payload.sendEmail()` with:
   - Campaign subject/content
   - Unsubscribe link using subscriber's token
6. Update campaign: status `sent`, recipientCount, sentAt
7. On failure: set status `failed`, log errors

**Rate limiting:** Send in batches (e.g., 50/second) to respect email provider limits.

## Files

### New Files
- `src/collections/NewsletterSubscribers.ts`
- `src/collections/NewsletterCampaigns.ts`
- `src/endpoints/sendNewsletter.ts`
- `src/app/(frontend)/[locale]/unsubscribe/page.tsx`

### Modified Files
- `src/payload.config.ts` — register collections + endpoint
- `src/components/ecommerce/Newsletter.tsx` — wire to real API
- `.env.example` — add `SITE_URL` (for unsubscribe links)

## Verification

- Submit newsletter form on storefront -> verify subscriber created in collection
- Check subscriber has unsubscribeToken generated
- Visit unsubscribe URL with token -> verify status changes to `unsubscribed`
- Create a campaign in admin, send it -> verify emails delivered to active subscribers
- Verify unsubscribed users don't receive campaign
- Verify duplicate email submissions are rejected (unique constraint)
