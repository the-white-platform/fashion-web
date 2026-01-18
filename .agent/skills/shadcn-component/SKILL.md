---
name: shadcn-component
description: Guidelines for extending the design system with accessibility, composition, and ownership in mind
---

# UI Component Architecture (Design System)

This skill defines the standards for extending the `shadcn/ui` based design system. We do not just "add components"; we build a cohesive language.

## 🧠 Philosophy: Ownership & Adaptability

We adhere to the **Copy-Paste** architecture of shadcn/ui.

- **You Own The Code**: Once a component is in `src/components/ui/`, it is OURS. We modify it to fit our Design Tokens, Accessibility rules, and functionality. It is not an external dependency we are stuck with.
- **Headless Base**: We rely on Radix UI (or similar) for _behavior_ (accessibility, keyboard nav) and Tailwind for _style_.

## 📐 Design Tokens & Theming

- **Consistency**: Use the defined CSS variables (`--primary`, `--muted`, `--accent`) via Tailwind utility classes.
- **Do Not Hardcode**: Avoid `bg-[#123456]`. Always use semantic color tokens `bg-primary`. This ensures Dark Mode works out of the box.
- **Typography**: Stick to the type scale. Don't invent font sizes.

## ♿ Accessibility (A11y) First

A component is not done until it is accessible.

- **Keyboard Nav**: Can I use it without a mouse?
- **Focus States**: Is `focus-visible` transparent and obvious?
- **ARIA**: Are appropriate roles and states (`aria-expanded`, `aria-activedescendant`) managed? (Radix handles most of this, don't break it).

## 🧩 Component Pattern: CVA

Use `class-variance-authority` (CVA) to manage component states.

- **Variants**: Define visual styles (Solid, Outline, Ghost).
- **Sizes**: Define scale (Sm, Default, Lg).
- **Composition**: Components should be open for extension via `className` props merging (using `cn()` utility).

## 🏗️ Folder Structure Strategy

- `src/components/ui/` -> **Primitives**. The atoms. Buttons, Inputs, Cards. Generic.
- `src/components/ecommerce/` -> **Business Logic**. Product Cards, Cart Drawers. These consume Primitives.
- `src/components/common/` -> **Compound Patterns**. Search Bars, Page Headers.

## 📝 Implementation Checklist

- [ ] **Accessibility Check**: Does it work with Screen Readers and Keyboard?
- [ ] **Responsive**: mobile-first or desktop-first consistent strategy?
- [ ] **Dark Mode**: Did I test the inverted color scheme?
- [ ] **Exports**: Is the component exported cleanly?
- [ ] **Bundle Size**: Am I importing a massive library for a simple tooltip? (Avoid bloat).
