'use client'

import React from 'react'
import NProgress from 'nprogress'
import { BaseLink } from './routing'

const LinkComponent = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof BaseLink>>(
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
)

LinkComponent.displayName = 'Link'

export const Link = LinkComponent as any
