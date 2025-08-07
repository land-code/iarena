'use client'

import { useActionState } from 'react'
import { Button } from '../ui/button'
import { generateLesson } from '@/actions/lesson/create'
import { Loader2Icon } from 'lucide-react'

type GenerateLessonProps = {
  lessonId: string
}

export default function GenerateLesson({ lessonId }: GenerateLessonProps) {
  const [state, action, pending] = useActionState(generateLesson, { status: 'idle' })
  return (
    <>
      <form action={action}>
        <input readOnly name='lesson-id' value={lessonId} hidden />
        <Button disabled={pending}>
          {pending && <Loader2Icon className='animate-spin' />}
          {pending ? 'Generando lección...' : 'Generar lección'}
        </Button>
      </form>
      {state.status === 'error' && <p className='text-destructive'>{state.error}</p>}
    </>
  )
}
