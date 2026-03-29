# Spec 17: Live Customer Support (Real-Time)

## Summary

Upgrade the admin chat dashboard and customer chatbot to support real-time messaging via Server-Sent Events (SSE), enabling true live admin-to-customer chat.

## Depends On

- Spec 16 (chat dashboard — collections and basic flow already exist)

## Architecture Choice: SSE over WebSocket

**Why SSE:**
- Works with existing Next.js App Router (no separate WS server needed)
- Simpler to deploy on Cloud Run (HTTP-based)
- One-directional stream (server -> client) + regular POST for sending
- Sufficient for chat (messages are sent via POST, received via SSE stream)

## SSE Stream Endpoint

### New File: `src/app/api/chat/stream/route.ts`

`GET /api/chat/stream?conversationId=xxx`

- Authenticated (customer via JWT or admin via session)
- Returns `text/event-stream` response
- Polls `chat-messages` collection for new messages since last check (every 1-2 seconds)
- Sends new messages as SSE events:
  ```
  event: message
  data: {"id": 1, "role": "admin", "content": "How can I help?", "senderName": "Mai", "createdAt": "..."}
  ```
- Sends heartbeat every 15s to keep connection alive
- Closes when conversation status is `closed`

### Typing Indicators

Additional SSE event types:
```
event: typing
data: {"role": "admin"}

event: status_change
data: {"status": "admin_takeover"}
```

Typing state stored in a lightweight in-memory map (not persisted to DB).

## Typing Indicator Endpoint

### New File: `src/app/api/chat/typing/route.ts`

`POST /api/chat/typing`

Request: `{ conversationId, role }` — signals that someone is typing.

Stored in-memory (Map or simple cache), expires after 3 seconds. SSE stream checks this map and emits `typing` events.

## Customer-Side Changes

### Modified File: `src/components/ecommerce/WolfiesChatbot.tsx`

Replace polling with SSE:
1. On chat open, connect to `/api/chat/stream?conversationId=xxx`
2. Listen for `message` events — append to chat UI
3. Listen for `typing` events — show "Agent is typing..." indicator
4. Listen for `status_change` events — update UI (takeover/AI mode)
5. Send messages via existing POST to `/api/ai/chat` (or `/api/chat/send` for admin takeover mode)
6. On component unmount, close EventSource connection

### New Endpoint: `src/app/api/chat/send/route.ts`

`POST /api/chat/send`

For sending messages when in admin takeover mode (bypasses AI):
```json
{
  "conversationId": "xxx",
  "content": "Hello, how can I help?",
  "role": "admin"
}
```

Creates a `chat-messages` document. The SSE stream picks it up and delivers to the customer.

## Admin-Side Changes

### Modified File: `src/admin/ChatDashboard/index.tsx`

Update the conversation detail panel:
1. Connect to SSE stream for real-time message updates
2. Show typing indicator when customer is typing
3. Send typing indicator when admin is typing
4. Messages appear instantly (no page refresh needed)
5. Sound/visual alert on new message from customer

## Online Presence

### New File: `src/app/api/chat/presence/route.ts`

`POST /api/chat/presence` — called every 30s by active admin users.

In-memory map of online admins. Chat dashboard shows:
- Green dot for online admins
- Customer widget shows "Support agents online" when admins are present

## Files

### New Files
- `src/app/api/chat/stream/route.ts` — SSE endpoint
- `src/app/api/chat/typing/route.ts` — typing indicator
- `src/app/api/chat/send/route.ts` — direct message send
- `src/app/api/chat/presence/route.ts` — admin online status

### Modified Files
- `src/components/ecommerce/WolfiesChatbot.tsx` — SSE client, typing indicators, takeover UI
- `src/admin/ChatDashboard/index.tsx` — real-time updates, typing, presence

## Scaling Considerations

- SSE with polling DB works for low-medium traffic (< 100 concurrent chats)
- For higher scale, consider Redis pub/sub as message broker between SSE connections
- Cloud Run supports SSE but has a 60-minute request timeout — reconnect logic needed
- In-memory typing/presence state is per-instance; use Redis if running multiple instances

## Verification

- Admin opens chat dashboard, customer sends message -> appears in real-time (no refresh)
- Admin replies -> customer sees message instantly
- Customer typing -> admin sees "typing..." indicator
- Admin typing -> customer sees "typing..." indicator
- Close browser tab -> SSE connection closes cleanly
- Reconnect after network interruption -> messages resume
- Multiple admin tabs -> all receive updates
