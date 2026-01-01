'use client'

import React from 'react'
import NProgress from 'nprogress'
import { BaseLink } from './routing'

export const Link = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof BaseLink>>(
  (props, ref) => {
    return (
      <BaseLink
        ref={ref}
        {...props}
        onClick={(e) => {
          NProgress.start()
          props.onClick?.(e)
        }}
      />
    )
  },
) as any

;(Link as any).displayName = 'Link'
