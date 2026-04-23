import React from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  PackageSearch,
  ListOrdered,
  MessageCircle,
  Send,
  ArrowRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Tool {
  label: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}

const TOOLS: Tool[] = [
  {
    label: 'Accounting',
    description: 'Revenue trends, order analytics, and customer metrics in one dashboard.',
    href: '/management/accounting',
    icon: TrendingUp,
    accent: 'from-emerald-500/10 to-emerald-500/0 text-emerald-600',
  },
  {
    label: 'Inventory Alerts',
    description: 'Low-stock and out-of-stock SKU overview across every color variant.',
    href: '/management/inventory-alerts',
    icon: PackageSearch,
    accent: 'from-amber-500/10 to-amber-500/0 text-amber-600',
  },
  {
    label: 'Bulk Orders',
    description: 'Select multiple orders and transition statuses in a single pass.',
    href: '/management/bulk-orders',
    icon: ListOrdered,
    accent: 'from-blue-500/10 to-blue-500/0 text-blue-600',
  },
  {
    label: 'Chat Dashboard',
    description: 'Live chat conversations with admin takeover and canned replies.',
    href: '/management/chat-dashboard',
    icon: MessageCircle,
    accent: 'from-violet-500/10 to-violet-500/0 text-violet-600',
  },
  {
    label: 'Zalo Sender',
    description: 'Send ZNS templates to customers and mint single-use discount codes.',
    href: '/management/zalo-sender',
    icon: Send,
    accent: 'from-rose-500/10 to-rose-500/0 text-rose-600',
  },
]

export default function ManagementIndex() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
          Dashboard
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Operations Tools
        </h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Pick a tool to run day-to-day operations: accounting, inventory, chat, order batches, and
          Zalo messaging. Access is restricted to users with an{' '}
          <span className="font-medium">admin</span> or <span className="font-medium">manager</span>{' '}
          role.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-60 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800 ${tool.accent.split(' ').pop()}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <div className="relative mt-6">
                <div className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                  {tool.label}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {tool.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
