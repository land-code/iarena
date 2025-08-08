'use client'

import { useNavFooter } from '@/contexts/nav-footer'
import { Button } from '../ui/button'
import Link from 'next/link'

export default function NavigationFooter() {
  const { nextLessonUrl, backLessonUrl, nextUrl, backUrl } = useNavFooter()

  const nextButtonUrl = nextUrl ?? nextLessonUrl
  const backButtonUrl = backUrl ?? backLessonUrl

  return (
    <footer className='bg-accent flex w-full items-center justify-between p-4'>
      <Button variant='secondary' asChild>
        {backButtonUrl && (
          <Link prefetch={true} href={backButtonUrl}>
            {backUrl ? '<- Anterior' : '<- Anterior lección'}
          </Link>
        )}
      </Button>
      <Button asChild>
        {nextButtonUrl && (
          <Link prefetch={true} href={nextButtonUrl}>
            {nextUrl ? 'Siguiente ->' : 'Siguiente lección ->'}
          </Link>
        )}
      </Button>
    </footer>
  )
}
