import * as React from 'react'
import Link from 'next/link'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/50 hover:from-indigo-600 hover:to-indigo-700',
                destructive: 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/50',
                outline: 'border-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800',
                secondary: 'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
                ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
                link: 'text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400',
                success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/50 hover:from-emerald-600 hover:to-emerald-700',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3 text-xs',
                lg: 'h-12 rounded-lg px-8 text-base',
                icon: 'h-10 w-10 rounded-lg',
                'icon-sm': 'h-8 w-8 rounded-md',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    isLoading?: boolean
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading = false, icon, iconPosition = 'left', ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && <span className="mr-2 flex items-center">{icon}</span>}
                        {props.children}
                        {icon && iconPosition === 'right' && <span className="ml-2 flex items-center">{icon}</span>}
                    </>
                )}
            </Comp>
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
