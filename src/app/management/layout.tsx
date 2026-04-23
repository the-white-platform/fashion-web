import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  LayoutDashboard,
  TrendingUp,
  PackageSearch,
  ListOrdered,
  MessageCircle,
  Send,
  ArrowLeft,
  LogOut,
  Shield,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/management', icon: LayoutDashboard },
  { label: 'Accounting', href: '/management/accounting', icon: TrendingUp },
  { label: 'Inventory', href: '/management/inventory-alerts', icon: PackageSearch },
  { label: 'Bulk Orders', href: '/management/bulk-orders', icon: ListOrdered },
  { label: 'Chat', href: '/management/chat-dashboard', icon: MessageCircle },
  { label: 'Zalo Sender', href: '/management/zalo-sender', icon: Send },
]

export default async function ManagementLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  const role = (user as { role?: string } | null)?.role
  if (!user || !['admin', 'manager'].includes(role ?? '')) {
    redirect('/admin')
  }

  const initials = ((user as { name?: string; email: string }).name || user.email || '?')
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-5 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">THE WHITE</span>
            <span className="text-[11px] uppercase tracking-wider text-neutral-500">
              Management
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Tools
          </div>
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                  >
                    <Icon className="h-4 w-4 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {(user as { name?: string }).name || user.email}
              </div>
              <div className="truncate text-[11px] uppercase tracking-wider text-neutral-500">
                {role}
              </div>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            <Link
              href="/admin"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Admin
            </Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/users/logout"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </a>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/80 px-6 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Operations Console
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="hidden sm:inline">{user.email}</span>
            <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              {role}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
