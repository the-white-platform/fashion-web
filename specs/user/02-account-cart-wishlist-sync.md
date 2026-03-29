# Spec 02: Cart & Wishlist Server Sync

## Summary

Sync cart and wishlist to the server for authenticated users so data persists across devices and survives localStorage clears. Merge guest data on login.

## Architecture

- **Guest users**: continue using localStorage (no change)
- **Authenticated users**: localStorage as cache, server as source of truth
- **On login**: merge localStorage items with server items, then sync

## Cart Sync

### Modified File: `src/collections/Users/index.ts`

Add field:

| Field | Type | Description |
|-------|------|-------------|
| `cart` | array | Server-side cart |
| `cart.product` | relationship (products) | Product reference |
| `cart.variant` | text | Color variant name |
| `cart.size` | text | Selected size |
| `cart.quantity` | number | Quantity |

### Modified File: `src/contexts/CartContext.tsx`

Add sync logic:

**On login (user becomes available):**
1. Fetch server cart from user object (already loaded via `/api/users/me`)
2. Merge with localStorage cart:
   - Items in both: keep higher quantity
   - Items only in localStorage: add to server
   - Items only on server: add to local state
3. Push merged cart to server: `PATCH /api/users/{id}` with cart array
4. Update localStorage with merged state

**On cart mutation (add/remove/update):**
1. Update local state + localStorage (immediate, as now)
2. Debounced PATCH to server (500ms debounce to batch rapid changes)
3. On PATCH failure: log warning, keep local state (retry on next mutation)

**On logout:**
1. Clear local cart state
2. Clear localStorage cart
3. Server cart remains for next login

**Debounce utility:** simple `setTimeout`-based debounce (no new dependency needed).

### Conflict Resolution

- Local state is always the "working" state (for responsiveness)
- Server is updated asynchronously (debounced)
- On login, server + local are merged (union, higher quantity wins)
- No real-time multi-device sync (last write wins on save)

## Wishlist Sync

### Modified File: `src/collections/Users/index.ts`

Add field:

| Field | Type | Description |
|-------|------|-------------|
| `wishlist` | array | Server-side wishlist |
| `wishlist.product` | relationship (products) | Product reference |

### Modified File: `src/contexts/WishlistContext.tsx`

Same pattern as cart:

**On login:** merge localStorage wishlist with server (union of product IDs).

**On toggle:** update local + debounced PATCH to server.

**On logout:** clear local, server persists.

### Wishlist is simpler than cart — just product IDs, no variants/quantities.

## API Considerations

Both cart and wishlist use `PATCH /api/users/{id}` which is already available. No new endpoints needed.

Payload's REST API allows partial updates — only send `cart` or `wishlist` field in the PATCH body.

## Files

### Modified Files
- `src/collections/Users/index.ts` — add cart + wishlist array fields
- `src/contexts/CartContext.tsx` — add server sync, merge on login, debounced save
- `src/contexts/WishlistContext.tsx` — add server sync, merge on login

## Verification

- Add items to cart as guest -> login -> verify items persist on server
- Login on device A, add items -> login on device B -> verify items appear
- Add items while logged in -> clear localStorage -> refresh -> cart restored from server
- Rapid add/remove -> verify debounced PATCH (not N API calls)
- Logout -> verify cart cleared locally, persists on server
- Login again -> verify cart restored
- Same flows for wishlist
