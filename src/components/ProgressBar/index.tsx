'use client'

import React, { useEffect } from 'react'
import NProgress from 'nprogress'
import { usePathname, useSearchParams } from 'next/navigation'

export const ProgressBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.configure({ showSpinner: false })
  }, [])

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  return null
}
