'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Ruler } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/utilities/cn'

// Shape matches the generated Payload type for Product.sizeChart, kept loose
// so the component can be reused wherever the sizeChart group is populated
// (product pages, admin previews, etc.) without importing the full Product
// type graph.
export interface SizeChartData {
  columns?:
    | {
        id?: string | null
        header?: string | null
      }[]
    | null
  rows?:
    | {
        id?: string | null
        cells?:
          | {
              id?: string | null
              value?: string | null
            }[]
          | null
      }[]
    | null
  note?: string | null
}

interface SizeChartModalProps {
  sizeChart?: SizeChartData | null
  productName?: string
  triggerClassName?: string
}

export function hasSizeChartData(sizeChart?: SizeChartData | null): boolean {
  if (!sizeChart) return false
  const cols = sizeChart.columns?.filter((c) => (c.header ?? '').trim().length > 0) ?? []
  const rows = sizeChart.rows?.filter((r) => (r.cells?.length ?? 0) > 0) ?? []
  return cols.length > 0 && rows.length > 0
}

export function SizeChartModal({ sizeChart, productName, triggerClassName }: SizeChartModalProps) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('products')

  if (!hasSizeChartData(sizeChart)) return null

  const columns = (sizeChart!.columns ?? []).filter((c) => (c.header ?? '').trim().length > 0)
  const rows = (sizeChart!.rows ?? []).filter((r) => (r.cells?.length ?? 0) > 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-dotted transition-colors',
            triggerClassName,
          )}
        >
          <Ruler className="w-3.5 h-3.5" />
          {t('viewSizeChart')}
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-auto max-w-xl max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="uppercase tracking-wide text-base sm:text-lg pr-8 break-words">
            {productName ? `${t('sizeChartTitle')} — ${productName}` : t('sizeChartTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="px-4 sm:px-6 pb-6 overflow-y-auto flex-1 min-h-0">
          {/* Transposed table — the Payload schema stores rows-as-sizes /
              columns-as-measurements because that's how admins naturally
              edit it, but rendered as measurements-as-rows / sizes-as-columns
              so the chart fits any viewport without horizontal scroll. */}
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-foreground text-background">
                <th className="border border-border px-2.5 sm:px-4 py-2.5 sm:py-3 uppercase tracking-wide text-left font-semibold">
                  {columns[0]?.header}
                </th>
                {rows.map((row, rIdx) => (
                  <th
                    key={row.id ?? `size-${rIdx}`}
                    className="border border-border px-2.5 sm:px-4 py-2.5 sm:py-3 uppercase tracking-wide text-center font-semibold"
                  >
                    {row.cells?.[0]?.value ?? '—'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columns.slice(1).map((col, colIdx) => {
                const measurementIdx = colIdx + 1
                return (
                  <tr
                    key={col.id ?? `measurement-${measurementIdx}`}
                    className={colIdx % 2 === 0 ? 'bg-muted/50' : 'bg-background'}
                  >
                    <td className="border border-border px-2.5 sm:px-4 py-2.5 sm:py-3 font-semibold uppercase tracking-wide text-muted-foreground">
                      {col.header}
                    </td>
                    {rows.map((row, rIdx) => {
                      const cell = row.cells?.[measurementIdx]
                      return (
                        <td
                          key={cell?.id ?? `cell-${measurementIdx}-${rIdx}`}
                          className="border border-border px-2.5 sm:px-4 py-2.5 sm:py-3 text-center"
                        >
                          {cell?.value ?? '—'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {sizeChart?.note && sizeChart.note.trim().length > 0 && (
            <div className="mt-6 p-4 bg-muted/40 rounded-sm border border-border">
              <p className="text-xs uppercase tracking-wide font-semibold mb-2 text-muted-foreground">
                {t('sizeChartNote')}
              </p>
              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {sizeChart.note}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
