import { cn } from 'src/utilities/cn'
import * as React from 'react'

import { X } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, className, onClear, value, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          className={cn(
            'flex h-10 w-full rounded-sm border border-border bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            onClear && value ? 'pr-8' : '',
            className,
          )}
          ref={ref}
          type={type}
          value={value}
          {...props}
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
