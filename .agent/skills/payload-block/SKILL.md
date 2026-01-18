---
name: payload-block
description: Strategy for building proprietary, reusable layout blocks bridging content and frontend
---

# Payload Block Design System

This skill outlines the strategy for building modular, reusable layout blocks that bridge Content Management and Frontend Rendering.

## 🧠 The "Component-Content" Bridge

When creating a block, you are defining two contracts simultaneously:

1.  **The Editor Interface**: How the content creator inputs data.
2.  **The Render Data**: The exact props the React component receives.

**Goal**: Seamless portability between the DB schema and the UI component props.

## 🏗️ Atomic Design Principles

- **Separation of Concerns**: The Block Config defines _Structure_. The React Component defines _Presentation_.
- **Composition**: Avoid "One Block to Rule Them All". If a block has 20 fields and 5 tabs, it's likely too complex. Break it down or use `array` fields for repetitive structures (e.g., Testimonials, Features).
- **Preset vs. Freeform**: Decide how much control the editor needs.
  - _Bad_: A color picker for every text element.
  - _Good_: A `theme` select (e.g., "Dark", "Light", "Accent"). Enforce the Design System.

## 🎨 Layout & Visual Logic

- **Responsive First**: Data fields should allow for responsive adaptations (e.g., mobile image vs desktop image) only if strictly necessary. Usually, CSS handles this.
- **Semantic HTML**: The component must output semantic tags (`<section>`, `<article>`, `<aside>`) for accessibility and SEO.
- **Container Queries**: Design blocks to be context-agnostic. They should look good whether full-width or inside a sidebar.

## 🚀 Performance & Hydration

- **Server Components First**: Blocks should be Server Components by default. Only add `'use client'` if interactivity (framers, state) is required.
- **Media Optimization**: Never render a raw URL. Always use the project's `<Media />` component which handles `next/image` optimization, focal points, and sizes.
- **Lazy Loading**: if a block is heavy (maps, complex charts), implement conditional dynamic imports.

## 🛠️ Developer Experience (DX)

- **Strict Prop Interfaces**: The Component props MUST match the generated `Payload` types exactly.
- **Null Safety**: Defensive programming. Fields are optional in the DB. Always check `if (!data) return null;`.
- **Preview Parity**: The backend Live Preview should match the frontend deployment 1:1.

## 📝 Implementation Checklist

- [ ] **Config**: Schema defined in `src/blocks/YourBlock/config.ts`?
- [ ] **Component**: React component in `src/blocks/YourBlock/Component.tsx`?
- [ ] **Registry**: Added to `RenderBlocks.tsx`?
- [ ] **Props**: Props interface extends the generated Payload Type?
- [ ] **Fields**: Used `RichText` and `Media` primitives?
