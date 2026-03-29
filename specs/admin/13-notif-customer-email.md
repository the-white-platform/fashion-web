# Spec 13: Customer Email Notifications

## Summary

Transactional email system for customers — order confirmation, status updates, shipping notifications. Requires configuring an email service provider.

## Depends On

- Spec 03 (order activity log — triggers for status changes)

## Email Service Setup

### Modified File: `src/payload.config.ts`

Configure Payload's email adapter. Recommended: **Resend** (simple API, good free tier).

```
email: resendAdapter({
  apiKey: process.env.RESEND_API_KEY,
  defaultFromAddress: process.env.EMAIL_FROM || 'noreply@thewhite.vn',
  defaultFromName: 'The White',
})
```

**New dependency:** `@payloadcms/email-resend` (or `nodemailer` adapter as fallback)

**New env vars:**
- `RESEND_API_KEY`
- `EMAIL_FROM` (default: `noreply@thewhite.vn`)

## Email Templates

### New Directory: `src/emails/`

Each template is a function returning `{ subject, html }` with localized content (vi/en).

| Template File | Trigger | Content |
|---------------|---------|---------|
| `orderConfirmation.ts` | Order created | Order number, items list, totals, shipping address |
| `orderStatusUpdate.ts` | Order status changed | New status, order number, status-specific message |
| `shippingNotification.ts` | Status -> shipping | Carrier, tracking number, estimated delivery |
| `deliveryConfirmation.ts` | Status -> delivered | Thank you message, review prompt |
| `refundNotification.ts` | Payment status -> refunded | Refund amount, order reference |
| `passwordReset.ts` | Password reset request | Reset link (override Payload default) |

### Template Structure

Each template function signature:
```
(params: { order, locale }) => { subject: string, html: string }
```

- HTML templates with inline CSS (email-safe)
- Brand colors and logo from The White
- Bilingual: render in the customer's locale (from order or user preference)
- Responsive (mobile-friendly)

## Email Sending Utility

### New File: `src/utilities/sendCustomerEmail.ts`

```
sendCustomerEmail({ payload, to, template, data, locale })
```

- Calls the appropriate template function
- Sends via `payload.sendEmail({ to, subject, html })`
- Logs send attempts (success/failure) for debugging
- Respects customer email preferences (if implemented)

## Hook Integration

### Modified File: `src/collections/Orders.ts` (afterChange hook)

| Order Event | Email Sent |
|-------------|-----------|
| Order created (status = pending) | `orderConfirmation` to `customerInfo.email` |
| Status -> confirmed | `orderStatusUpdate` (order confirmed) |
| Status -> shipping | `shippingNotification` with tracking info |
| Status -> delivered | `deliveryConfirmation` |
| Status -> cancelled | `orderStatusUpdate` (order cancelled) |
| Payment status -> refunded | `refundNotification` |

### New File: `src/collections/Orders/hooks/sendOrderEmails.ts`

`afterChange` hook that:
1. Compares `previousDoc.status` with `doc.status`
2. If changed, determines which email template to use
3. Calls `sendCustomerEmail` with order data

## Files

### New Files
- `src/emails/orderConfirmation.ts`
- `src/emails/orderStatusUpdate.ts`
- `src/emails/shippingNotification.ts`
- `src/emails/deliveryConfirmation.ts`
- `src/emails/refundNotification.ts`
- `src/emails/passwordReset.ts`
- `src/utilities/sendCustomerEmail.ts`
- `src/collections/Orders/hooks/sendOrderEmails.ts`

### Modified Files
- `src/payload.config.ts` — email adapter configuration
- `src/collections/Orders.ts` — register sendOrderEmails hook
- `package.json` — add `@payloadcms/email-resend` dependency
- `.env.example` — add RESEND_API_KEY, EMAIL_FROM

## Verification

- Create an order -> check email inbox for order confirmation
- Change order status to shipping -> verify shipping email with tracking
- Change to delivered -> verify delivery confirmation email
- Cancel an order -> verify cancellation email
- Test with both vi and en locales -> verify correct language
- Test with invalid email -> verify error is logged, not thrown
