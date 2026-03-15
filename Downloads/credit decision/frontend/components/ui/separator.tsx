import * as React from 'react'
import { cn } from '@/lib/utils'

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
}

const Separator = ({ className, orientation = 'horizontal', ...props }: SeparatorProps) => (
  <div
    role="separator"
    className={cn(
      'bg-slate-200',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
    {...props}
  />
)

export { Separator }
