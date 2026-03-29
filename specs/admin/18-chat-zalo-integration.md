# Spec 18: Zalo OA Integration

## Summary

Programmatic integration with Zalo Official Account (OA) API for sending order notifications and enabling customer support via Zalo messaging.

## Depends On

- Spec 13 (customer email — shares notification trigger points)
- Spec 16 (chat dashboard — Zalo messages appear alongside web chat)

## Zalo OA API Overview

Zalo OA (Official Account) API allows businesses to:
- Send transactional notifications to followers
- Receive and reply to customer messages
- Requires customer to follow the OA first

**API Base:** `https://openapi.zalo.me/v3.0/oa/`

## Environment Variables

```
ZALO_OA_ID=            # Official Account ID
ZALO_APP_ID=           # Zalo App ID
ZALO_APP_SECRET=       # App secret key
ZALO_OA_ACCESS_TOKEN=  # Access token (needs periodic refresh)
ZALO_OA_REFRESH_TOKEN= # Refresh token
ZALO_WEBHOOK_SECRET=   # Webhook verification token
```

## Zalo Token Management

### New File: `src/lib/zalo.ts`

Zalo OA access tokens expire (typically 24-48h). This utility:
- Stores current access/refresh tokens (in a Payload global or env)
- Auto-refreshes token via `POST https://oauth.zaloapp.com/v4/oa/access_token`
- Exposes `getZaloClient()` with valid token

## User Zalo Linking

### Modified File: `src/collections/Users/index.ts`

Add field:

| Field | Type | Description |
|-------|------|-------------|
| `zaloUserId` | text | Zalo user ID (set when they message the OA or follow) |
| `zaloNotifications` | checkbox | Opt-in for Zalo notifications (default false) |

Zalo user ID is captured when a customer messages the OA (via webhook) and matched by phone number or email.

## Outbound: Order Notifications via Zalo

### New File: `src/utilities/sendZaloNotification.ts`

```
sendZaloNotification({ zaloUserId, templateType, data })
```

Uses Zalo OA "send message" API to send ZNS (Zalo Notification Service) templates:

| Template | Trigger | Content |
|----------|---------|---------|
| Order confirmation | Order created | Order #, items summary, total |
| Shipping update | Status -> shipping | Tracking number, carrier |
| Delivery confirmation | Status -> delivered | Order #, thank you |

**Note:** ZNS templates must be pre-registered and approved by Zalo. The actual template IDs are stored in a Payload global or env vars.

### Integration with Order Hooks

### Modified File: `src/collections/Orders/hooks/sendOrderEmails.ts`

(Or new file `sendOrderNotifications.ts` that combines email + Zalo)

After sending email, also check:
1. Does the customer have a `zaloUserId`?
2. Is `zaloNotifications` enabled?
3. If yes, call `sendZaloNotification`

## Inbound: Receiving Zalo Messages

### New File: `src/app/api/zalo/webhook/route.ts`

Zalo sends messages to this webhook endpoint.

`POST /api/zalo/webhook`

Handles events:
- `user_send_text` — customer sends a text message
- `user_send_image` — customer sends an image
- `follow` — customer follows the OA
- `unfollow` — customer unfollows

**On message received:**
1. Find or create a `chat-conversations` document with source `zalo`
2. Create `chat-messages` with `role: user`, `channel: zalo`
3. If no admin takeover: forward to Wolfies AI, send AI reply back via Zalo API
4. If admin takeover: message appears in chat dashboard for admin to reply

**On follow:**
1. Try to match Zalo user to existing customer (by phone from Zalo profile)
2. If matched, set `zaloUserId` on the User document

### Webhook Verification

`GET /api/zalo/webhook` — Zalo sends a verification challenge on setup. Return the challenge token.

## Admin Reply to Zalo

### Modified File: `src/admin/ChatDashboard/index.tsx`

When viewing a Zalo-sourced conversation:
- Show Zalo badge/icon on the conversation
- Admin reply sends message via Zalo OA API instead of (or in addition to) web chat
- Use `POST https://openapi.zalo.me/v3.0/oa/message/cs` to send reply

### New File: `src/utilities/sendZaloMessage.ts`

```
sendZaloMessage({ zaloUserId, text })
```

Low-level utility to send a text message to a Zalo user via OA API.

## Chat Messages — Channel Field

### Modified File: `src/collections/ChatMessages.ts`

Add field:

| Field | Type | Description |
|-------|------|-------------|
| `channel` | select | web, zalo | Message source/destination |

Default: `web`. Zalo webhook sets `zalo`. Admin replies to Zalo conversations are sent via Zalo API.

### Modified File: `src/collections/ChatConversations.ts`

Add field:

| Field | Type | Description |
|-------|------|-------------|
| `channel` | select | web, zalo | Conversation source |
| `zaloUserId` | text | Zalo user ID for this conversation |

## Files

### New Files
- `src/lib/zalo.ts` — Zalo API client + token management
- `src/utilities/sendZaloNotification.ts` — ZNS template sending
- `src/utilities/sendZaloMessage.ts` — Direct message sending
- `src/app/api/zalo/webhook/route.ts` — Inbound webhook handler

### Modified Files
- `src/collections/Users/index.ts` — add zaloUserId, zaloNotifications fields
- `src/collections/ChatConversations.ts` — add channel, zaloUserId fields
- `src/collections/ChatMessages.ts` — add channel field
- `src/collections/Orders/hooks/sendOrderEmails.ts` — add Zalo notification dispatch
- `src/admin/ChatDashboard/index.tsx` — Zalo badge, reply via Zalo API
- `src/payload.config.ts` — no collection changes (fields added to existing)
- `.env.example` — add Zalo env vars

## Zalo OA Setup Requirements (External)

1. Register a Zalo Official Account at https://oa.zalo.me
2. Create a Zalo App at https://developers.zalo.me
3. Configure webhook URL to `https://yourdomain.com/api/zalo/webhook`
4. Register ZNS message templates for order notifications
5. Get templates approved by Zalo (takes 1-3 business days)

## Verification

- Customer follows Zalo OA -> zaloUserId linked to their account
- Create an order for a Zalo-linked customer -> Zalo notification received
- Customer messages via Zalo -> appears in admin chat dashboard with Zalo badge
- Admin replies in dashboard -> customer receives reply in Zalo app
- AI auto-replies when no admin takeover
- Unfollow -> notifications stop
