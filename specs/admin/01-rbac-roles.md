# Spec 01: RBAC — User Roles

## Summary

Add a `role` field to the Users collection and create reusable role-checking access functions.

## Roles

| Role | Admin Panel Access | Description |
|------|-------------------|-------------|
| `admin` | Yes | Full access to everything |
| `editor` | Yes | Manage products, orders, coupons, content — no user management or destructive deletes |
| `staff` | Yes | Read-only + update order status |
| `customer` | No | Default for storefront users |

## Changes

### New File: `src/access/roles.ts`

Export these access functions:

- `hasRole(user, roles[])` — helper, checks if user's role is in the list
- `isAdmin` — admin only
- `isAdminOrEditor` — admin or editor
- `canAccessAdmin` — admin, editor, or staff (controls admin panel access)
- `staffReadOnly` — admin/editor/staff can read (for commerce data)
- `adminFieldAccess` — field-level, admin only

### Modified File: `src/collections/Users/index.ts`

Add `role` field:

```
name: 'role'
type: select
required: true
defaultValue: 'customer'
options: admin, editor, staff, customer
labels: localized (vi/en)
admin.position: sidebar
field-level access.update: admin only
```

Update `access.admin` to use `canAccessAdmin` (restricts panel login to admin/editor/staff).

## Migration Notes

- Existing users get `role: 'customer'` by default
- First admin must be manually promoted via DB or seed endpoint
- Run `pnpm generate:types` after changes
