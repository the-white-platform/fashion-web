'use client'

import type { PayloadAdminBarProps } from 'payload-admin-bar'

import { cn } from '@/utilities/cn'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from 'payload-admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

const baseClass = 'admin-bar'

const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const collection = collectionLabels?.[segments?.[1]] ? segments?.[1] : 'pages'
  const router = useRouter()

  // Only CMS staff should see the admin bar on the storefront. Regular
  // shoppers have `role: 'customer'` (or no role) and must never see it —
  // it leaked onto the checkout for them and both added clutter and
  // exposed a stray "Logout" button mid-flow.
  const onAuthChange = React.useCallback((user) => {
    const role = (user as { role?: string } | null | undefined)?.role
    const isStaff = role === 'admin' || role === 'editor'
    setShow(Boolean(user?.id) && isStaff)
  }, [])

  // Also hide the admin bar on checkout-related routes even for staff —
  // it visually breaks the checkout layout and the "Logout" link is a
  // footgun mid-purchase.
  const firstSegment = segments?.[0]
  const isCheckoutRoute =
    firstSegment === 'checkout' ||
    firstSegment === 'login' ||
    firstSegment === 'register' ||
    firstSegment === 'forgot-password' ||
    firstSegment === 'reset-password'
  const shouldRender = show && !isCheckoutRoute

  return (
    <div
      className={cn(baseClass, 'py-2 bg-black text-white', {
        block: shouldRender,
        hidden: !shouldRender,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={process.env.NEXT_PUBLIC_SERVER_URL}
          collection={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
