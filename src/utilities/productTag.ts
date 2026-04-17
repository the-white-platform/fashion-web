/**
 * Localize a Product `tag` enum value for display.
 *
 * The Payload schema stores tag as its Vietnamese literal ('MỚI', 'BÁN CHẠY',
 * 'GIẢM 20%', …) for historical reasons. Rendering the raw value shows
 * Vietnamese text on /en. This helper maps to the `products.tags.<VALUE>`
 * translation key; unknown values fall back to the raw string so new enum
 * options still render instead of disappearing.
 */
export function localizeProductTag(
  tag: string | null | undefined,
  t: (key: string) => string,
): string {
  if (!tag) return ''
  try {
    const translated = t(`products.tags.${tag}`)
    if (translated && translated !== `products.tags.${tag}`) return translated
  } catch {
    /* missing key */
  }
  return tag
}
