import { cn } from '@/lib/utils'

export default function IArenaIcon({ className, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div className={cn('text-primary text-xl font-bold tracking-tight', className)} {...props}>
      <span className='text-foreground'>I</span>
      <span className='from-primary to-accent-foreground bg-gradient-to-r bg-clip-text text-transparent'>
        Arena
      </span>
    </div>
  )
}
