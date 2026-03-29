# Spec 01: Profile Editing, Forgot Password & Email Verification

## Summary

Enable users to edit their profile, reset forgotten passwords, and verify their email after registration.

## 1. Profile Edit Form

### Current State

Profile page (`/profile`) displays name, email, phone as read-only text. `UserContext.updateProfile()` exists but no form calls it.

### Changes

#### Modified File: `src/app/(frontend)/[locale]/profile/page.tsx`

Replace the read-only profile info tab with an editable form:

- **Fields**: Full name (text), phone (tel), email (email, read-only for OAuth users)
- **Edit mode**: "Edit" button toggles fields to editable inputs
- **Save**: calls `UserContext.updateProfile()` which PATCHes `/api/users/{id}`
- **Validation**: name required, phone 10+ digits, email format
- **Feedback**: toast notification on success/error (use Sonner)
- **OAuth guard**: email field disabled for Google/Facebook users (provider !== 'local')

#### Modified File: `src/contexts/UserContext.tsx`

`updateProfile()` already PATCHes to `/api/users/{id}` — verify it handles errors and refreshes local state after success.

## 2. Forgot Password / Password Reset

### New Pages

#### New File: `src/app/(frontend)/[locale]/forgot-password/page.tsx`

- Email input form
- Calls `POST /api/users/forgot-password` (Payload built-in endpoint)
- Success message: "Check your email for reset instructions"
- Rate limit hint: disable button for 60s after submit

#### New File: `src/app/(frontend)/[locale]/reset-password/page.tsx`

- Reads `?token=xxx` from URL (Payload sends this in reset email)
- New password + confirm password fields
- Calls `POST /api/users/reset-password` with `{ token, password }`
- On success: redirect to login with success message
- On failure: "Invalid or expired link" message

### Modified File: `src/app/(frontend)/[locale]/login/page.tsx`

Wire the existing "Forgot password?" link to `/forgot-password`.

### Email Requirement

Payload's `forgot-password` endpoint requires email to be configured (see admin spec 13). Without email config, this feature won't send emails.

## 3. Email Verification

### Modified File: `src/collections/Users/index.ts`

Add field:

| Field | Type | Description |
|-------|------|-------------|
| `emailVerified` | checkbox | Default false, set true after verification |
| `emailVerifyToken` | text, hidden | Random token sent in verification email |

### New Hook: `src/collections/Users/hooks/sendVerificationEmail.ts`

`afterChange` hook on user creation:
1. Generate random token, store in `emailVerifyToken`
2. Send email with verification link: `{SITE_URL}/{locale}/verify-email?token=xxx`

### New Page: `src/app/(frontend)/[locale]/verify-email/page.tsx`

- Reads `?token=xxx`
- Calls custom API endpoint to find user by token, set `emailVerified: true`
- Success: "Email verified!" with link to profile
- Failure: "Invalid or expired link"

### Optional: Verification Gate

Add a banner on profile page: "Please verify your email" with resend button. Do NOT block checkout or browsing — just a gentle reminder.

## Files

### New Files
- `src/app/(frontend)/[locale]/forgot-password/page.tsx`
- `src/app/(frontend)/[locale]/reset-password/page.tsx`
- `src/app/(frontend)/[locale]/verify-email/page.tsx`
- `src/collections/Users/hooks/sendVerificationEmail.ts`

### Modified Files
- `src/app/(frontend)/[locale]/profile/page.tsx` — editable form
- `src/app/(frontend)/[locale]/login/page.tsx` — link forgot password
- `src/collections/Users/index.ts` — emailVerified + emailVerifyToken fields
- `src/contexts/UserContext.tsx` — verify updateProfile works correctly

## Verification

- Edit profile name/phone -> save -> refresh page -> changes persist
- OAuth user -> email field is disabled
- Click "Forgot password" -> enter email -> receive reset email -> reset password -> login with new password
- Register new account -> receive verification email -> click link -> emailVerified = true
- Profile shows "verify email" banner when unverified
