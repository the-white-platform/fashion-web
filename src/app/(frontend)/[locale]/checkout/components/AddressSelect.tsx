'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/utilities/cn'

export interface AddressSelectProps {
  value?: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  placeholder: string
  emptyText: string
  disabled?: boolean
}

export function AddressSelect({
  value,
  options,
  onChange,
  placeholder,
  emptyText,
  disabled,
}: AddressSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    setTimeout(() => {
      const selected = options.find((o) => o.value === value)
      if (selected) {
        setInputValue(selected.label)
      } else if (!value) {
        setInputValue('')
      }
    }, 0)
  }, [value, options])

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()),
  )

  const handleBlur = () => {
    // Small delay to allow click on item to register
    setTimeout(() => {
      const selected = options.find((o) => o.value === value)
      if (selected) {
        setInputValue(selected.label)
      } else {
        setInputValue('')
      }
      setOpen(false)
    }, 200)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setOpen(true)
            if (e.target.value === '') {
              onChange('')
            }
          }}
          onClear={() => {
            setInputValue('')
            onChange('')
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          className="pr-8"
        />
        {!inputValue && (
          <ChevronsUpDown className="absolute right-2 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
        )}
      </div>

      {open && (
        <div className="absolute top-full z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          <Command shouldFilter={false}>
            <CommandList className="max-h-[200px] overflow-y-auto overflow-x-hidden">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(option.value)
                        setInputValue(option.label)
                        setOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}

      {/* Overlay to handle outside clicks roughly or we rely on logic?
          Simple: use a click listener on document or just rely on the user clicking away?
          If user clicks away, `onBlur` on Input triggers.
          But if I use onBlur, clicking the item might be missed if onBlur runs before onClick.
          So standard practice is using Popover logic.
      */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setOpen(false)
            const selected = options.find((o) => o.value === value)
            if (selected) {
              setInputValue(selected.label)
            } else {
              setInputValue('')
            }
          }}
        />
      )}
    </div>
  )
}
