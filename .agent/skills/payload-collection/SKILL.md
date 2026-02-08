---
name: payload-collection
description: Architectural mental models for designing robust data entities in Payload CMS
---

# Payload Collection Architecture

This skill provides the strategic mental model for designing robust data entities in Payload CMS.

## 🧠 Design Philosophy

Before creating a collection, answer these architectural questions:

1.  **Entity vs. Attribute**: Is this a standalone entity (Collection) or a property of another entity (Global/Array)?
2.  **Relationship Strategy**:
    - **Embed**: If the data is tightly coupled and always retrieved with the parent (e.g., Order Items).
    - **Reference (Relationship)**: If the data is shared, independent, or can grow indefinitely (e.g., Categories, Users).
3.  **Read/Write Ratio**: Optimizing for heavy read (caching) vs. heavy write (hooks efficiency).

## 🛡️ Security & Access Control (RBAC)

Security is not an afterthought; it is the first definition.

- **Least Privilege**: Start with `() => false` and open up incrementally.
- **Context Awareness**: Use `req.user` to scope access (e.g., "Can only update _own_ profile").
- **Field-Level Security**: protect sensitive fields (PII, internal flags) even if the document is public.

## ⚡ Performance & Scalability

- **Indexing**: Always index fields used in `where` queries.
- **Pagination**: Design for thousands, not tens. Avoid un-paginated UI queries.
- **Depth Control**: Be strict with `depth` in API calls. Prevent circular dependencies in relationship design.
- **Hooks Latency**: Keep `beforeChange` and `afterChange` lightweight. Offload heavy processing (emails, image processing) to background queues (Cloud Tasks) rather than blocking the request.

## 🧩 Schema & Validation

- **Strict Typing**: Define interfaces that mirror the business domain, not just the database shape.
- **Validation**: Enforce business invariants at the schema level (e.g., "End date must be after start date").
- **Normalization**: Avoid duplicating data unless necessary for specific read-performance gains (denormalization).

## 🛠️ Admin UX

- **Searchability**: Configure `admin.useAsTitle` and `admin.defaultColumns` for scannability.
- **Grouping**: Use logical groups to keep the navigation cleaner as the app grows.
- **Description**: Add contextual help text for editors, not just labels.

## 📝 Implementation Checklist

- [ ] **Slug**: Is it URL-friendly and singular?
- [ ] **Access Control**: Have I defined Create, Read, Update, Delete permissions explicitly?
- [ ] **Hooks**: Are side effects isolated? Are they idempotent?
- [ ] **Indexes**: Are queryable fields indexed?
- [ ] **Types**: run `pnpm generate:types` immediately after schema changes.
