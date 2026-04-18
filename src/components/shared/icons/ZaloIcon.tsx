import type { SVGProps } from 'react'

// Zalo icon — redrawn in outlined-stroke style to match lucide-react
// Facebook/Instagram/Shopee siblings. Rounded-square speech bubble with
// bottom-left tail (Zalo brand silhouette) and a stylized "Z" glyph.
export function ZaloIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 3h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8.5l-4 4v-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M9 8h6l-6 6h6" />
    </svg>
  )
}
