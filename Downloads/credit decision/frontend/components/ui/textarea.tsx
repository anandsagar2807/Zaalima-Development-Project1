import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
      className
    )}
    ref={ref}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
