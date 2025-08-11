'use client'

import { useNavFooter } from '@/contexts/nav-footer'
import { Button } from '../ui/button'
import Link from 'next/link'

export default function NavigationFooter() {
  const { nextLessonUrl, backLessonUrl, nextUrl, backUrl, type, state, checkExercise } =
    useNavFooter()

  const nextButtonUrl = nextUrl ?? nextLessonUrl
  const backButtonUrl = backUrl ?? backLessonUrl

  const isExerciseNotCompleted =
    type === 'exercise' && (state.status === 'idle' || state.status === 'error')
  const isExerciseError = type === 'exercise' && state.status === 'error'
  const isExerciseWell = type === 'exercise' && state.status === 'check'

  return (
    <footer
      className={`bg-accent flex w-full flex-col gap-4 p-4 ${isExerciseError ? 'bg-red-200 dark:bg-red-800' : ''} ${isExerciseWell ? 'bg-green-300 dark:bg-green-800' : ''} `}
    >
      {isExerciseError && <p className='text-destructive md:hidden'>{state.message}</p>}
      {isExerciseWell && <p className='md-hidden'>Muy bien. Sigue así</p>}
      <div className='flex w-full items-center justify-between gap-4'>
        <Button variant='secondary' asChild>
          {backButtonUrl && (
            <Link prefetch={true} href={backButtonUrl}>
              {backUrl ? '<- Anterior' : '<- Anterior lección'}
            </Link>
          )}
        </Button>
        <div>
          {isExerciseError && (
            <p className='text-destructive hidden md:inline-flex'>{state.message}</p>
          )}
        </div>
        {isExerciseNotCompleted && <Button onClick={() => checkExercise()}>Comprobar</Button>}
        {!isExerciseNotCompleted && nextButtonUrl && (
          <Button asChild>
            <Link prefetch={true} href={nextButtonUrl}>
              {nextUrl ? 'Siguiente ->' : 'Siguiente lección ->'}
            </Link>
          </Button>
        )}
      </div>
    </footer>
  )
}
