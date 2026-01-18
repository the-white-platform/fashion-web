---
name: i18n
description: Global architecture strategy for localization, SEO, and performance
---

# Global Internationalization Architecture

This skill defines the strategy for a truly global application, beyond just simple text replacement.

## 🧠 Fundamental Strategy: Localization(l10n) vs Translation (i18n)

- **Context over Content**: We don't just translate words; we adapt to locales. Dates, Currencies, Number Formats must use `Intl` standards, not string concatenation.
- **Routing Architecture**: We use **Sub-path Routing** (`/en/about`, `/vi/about`).
  - _Why?_ Best for SEO. Search engines treat them as distinct, indexable trees.
  - _Avoid_: Query params (`?lang=en`) or Cookies-only switching (bad for sharing/caching).

## 🔍 SEO & Discovery

- **Hreflang**: Critical for Google to know which version to serve where. The `Metadata` generator must output `alternates` correctly.
- **Canonicals**: Ensure self-referencing canonicals per locale.
- **Sitemaps**: Must generate valid XML sitemaps for _all_ locale variants.

## 📦 content & Management

- **Namespacing**: Organize JSON message files by _Feature_ or _Page_ (e.g., `checkout.json`, `auth.json`), not one giant `common.json`. This keeps bundles smaller and cognition clearer.
- **Fallback Strategy**: What happens if a key is missing in Vietnamese?
  - _Dev_: Warn/Error.
  - _Prod_: Fallback to Default Locale (English) to prevent UI crashes.

## ⚡ Performance

- **Server-Side Translation (RSC)**: Prefer `getTranslations` in Server Components. This keeps the translation JSON _on the server_ and doesn't bloat the Client Bundle.
- **Client-Side Translation**: Use `useTranslations` _only_ for interactive islands (buttons, alerts). Minimizing client-side dictionaries reduces TTI (Time To Interactive).

## 📝 Implementation Checklist

- [ ] **Routing**: Are all public pages wrapped in `[locale]` layout?
- [ ] **Metadata**: Are Title/Description translated for OG Tags?
- [ ] **Dynamic Content**: How do we handle database content? (e.g., Product Names).
  - Current Strategy: Payload localized fields (`localization: true` in config).
- [ ] **Static Content**: `next-intl` JSON files.
