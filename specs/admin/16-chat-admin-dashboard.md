# Spec 16: Admin Chat Dashboard

## Summary

Admin view to monitor, search, and manage Wolfies chatbot conversations — view transcripts, see customer info, and allow admin takeover from AI.

## Depends On

- Spec 01 (RBAC — admin/editor access)

## New Collection: `chat-conversations`

### New File: `src/collections/ChatConversations.ts`

| Field | Type | Description |
|-------|------|-------------|
| `user` | relationship (users) | Customer (if authenticated) |
| `guestId` | text | Anonymous session ID (if not logged in) |
| `status` | select | active, closed, admin_takeover |
| `startedAt` | date | When conversation started |
| `lastMessageAt` | date | Last message timestamp |
| `messageCount` | number | Total messages in conversation |
| `summary` | text | Auto-generated conversation summary (optional, from AI) |
| `tags` | array of text | Admin-applied tags (e.g., "complaint", "product-inquiry") |
| `assignedTo` | relationship (users) | Admin/staff assigned (for takeover) |

**Admin config:**
- `useAsTitle`: auto (show user email or guestId)
- `defaultColumns`: user, status, lastMessageAt, messageCount, assignedTo
- `group`: { vi: 'Ho tro', en: 'Support' }

**Access:**
- read: staff+
- create: server-only (created by chatbot API)
- update: adminOrEditor (assign, tag, close)
- delete: admin

## New Collection: `chat-messages`

### New File: `src/collections/ChatMessages.ts`

| Field | Type | Description |
|-------|------|-------------|
| `conversation` | relationship (chat-conversations), required | Parent conversation |
| `role` | select | user, assistant, admin | Who sent the message |
| `content` | textarea | Message text |
| `senderName` | text | Display name (customer name, "Wolfies", or admin name) |
| `metadata` | json | Optional (AI model used, tokens, etc.) |

**Admin config:**
- `defaultColumns`: conversation, role, content, createdAt
- `group`: { vi: 'Ho tro', en: 'Support' }
- `timestamps`: true

**Access:**
- read: staff+
- create: server-only + admin (for admin replies)
- update: nobody (immutable)
- delete: admin

## Chatbot API Integration

### Modified File: `src/app/api/ai/chat/route.ts` (or wherever the chat API lives)

Update the existing Wolfies chatbot endpoint to:

1. On first message from a user/session: create a `chat-conversations` document
2. On each message exchange: create `chat-messages` documents (one for user, one for assistant)
3. Update `lastMessageAt` and `messageCount` on the conversation
4. If conversation status is `admin_takeover`: skip AI, return a "connecting to agent" message

## Admin Chat Dashboard View

### New File: `src/admin/ChatDashboard/index.tsx`

Custom admin view at `/admin/chat-dashboard`:

**Left panel — Conversation list:**
- List of conversations sorted by lastMessageAt (most recent first)
- Filter by: status (active/closed/takeover), date range
- Search by customer name/email
- Each row: customer name, last message preview, time, status badge, unread indicator

**Right panel — Conversation detail:**
- Message thread (chat bubble UI)
- User messages on left, AI/admin messages on right
- Customer info card: name, email, phone, order count
- Action buttons:
  - "Take Over" — sets status to `admin_takeover`, assigns to current admin
  - "Return to AI" — sets status back to `active`, unassigns
  - "Close Conversation" — sets status to `closed`
  - "Add Tag" — tag the conversation
- Admin reply input (when in takeover mode)

### New File: `src/admin/ChatDashboardLink.tsx`

Nav link for admin sidebar.

## Admin Reply Flow

When admin sends a reply (in takeover mode):
1. Create `chat-messages` with `role: 'admin'`, `senderName: admin.name`
2. Message is delivered to customer on next poll/refresh of their chat widget

### Modified File: `src/components/ecommerce/WolfiesChatbot.tsx`

Update the chatbot widget to:
- Poll for new messages from the conversation (to receive admin replies)
- Show different UI when in admin takeover mode (e.g., "You're now chatting with a support agent")
- Continue working as normal AI chat when not in takeover

## Files

### New Files
- `src/collections/ChatConversations.ts`
- `src/collections/ChatMessages.ts`
- `src/admin/ChatDashboard/index.tsx`
- `src/admin/ChatDashboardLink.tsx`

### Modified Files
- `src/payload.config.ts` — register collections, view, nav link
- Chat API route — persist messages to collections
- `src/components/ecommerce/WolfiesChatbot.tsx` — support admin takeover, poll for admin messages

## Verification

- Customer starts a chat -> conversation appears in admin dashboard
- View conversation -> all messages visible in thread
- Click "Take Over" -> customer sees "agent connected" message
- Admin sends reply -> customer receives it in chat widget
- Click "Return to AI" -> customer resumes AI conversation
- Close conversation -> status updates, no more messages accepted
- Verify staff can view but not take over (if desired restriction)
