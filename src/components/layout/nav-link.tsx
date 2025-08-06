'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { usePathname } from 'next/navigation'

export function SidebarNavLink({ path, label }: { path: string; label: string }) {
  const currentPath = usePathname()
  const isActive = currentPath === path
  return (
    <Button variant='link' asChild>
      <Link
        href={path}
        className={`flex w-full items-center justify-start py-2 text-lg font-semibold ${isActive ? 'text-secondary-foreground' : ''}`}
      >
        {label}
      </Link>
    </Button>
  )
}

export function TopBarNavLink({ path, label }: { path: string; label: string }) {
  const currentPath = usePathname()
  const isActive = currentPath === path
  return (
    <Button asChild variant='link'>
      <Link href={path} className={`${isActive ? 'text-secondary-foreground' : ''}`}>
        {label}
      </Link>
    </Button>
  )
}
