import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-12 items-center justify-center rounded-full bg-slate-100 p-1 text-slate-600',
      className
    )}
    {...props}
  />
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex min-w-[120px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900',
      className
    )}
    {...props}
  />
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content className={cn('mt-6 focus-visible:outline-none', className)} {...props} />
)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
