'use client'

import NProgress from 'nprogress'
import { BaseUseRouter } from './routing'

export const useRouter = () => {
  const router = BaseUseRouter()
  return {
    ...router,
    push: (href: string, options?: any) => {
      NProgress.start()
      router.push(href, options)
    },
    replace: (href: string, options?: any) => {
      NProgress.start()
      router.replace(href, options)
    },
  }
}
