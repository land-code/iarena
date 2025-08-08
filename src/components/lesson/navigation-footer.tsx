'use client'

import { useNavFooter } from '@/contexts/nav-footer'
import { Button } from '../ui/button'
import Link from 'next/link'

export default function NavigationFooter() {
  const { nextUrl, backUrl } = useNavFooter()
  return (
    <footer className='bg-accent flex w-full items-center justify-between p-4'>
      <Button variant='secondary' asChild>
        <Link href={backUrl}>{'<- Anterior'}</Link>
      </Button>
      <Button asChild>
        <Link prefetch={true} href={nextUrl}>
          {'Siguiente ->'}
        </Link>
      </Button>
    </footer>
  )
}
