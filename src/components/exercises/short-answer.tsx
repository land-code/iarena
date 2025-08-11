'use client'

import { useNavFooter } from '@/contexts/nav-footer'
import { Input } from '../ui/input'
import { useEffect, useRef } from 'react'
import { checkExercise } from '@/actions/exercise/check'
import { toast } from 'sonner'

type ShortAnswerProps = {
  exerciseId: string
  answerExample: string | null
}

export default function ShortAnswer({ exerciseId, answerExample }: ShortAnswerProps) {
  const {
    checkExercise: checkExerciseFunction,
    checkExerciseFunctionRef,
    setState
  } = useNavFooter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      checkExerciseFunctionRef.current = async () => {
        const { error, status, result, feedback } = await checkExercise(
          exerciseId,
          inputRef.current?.value ?? ''
        )
        if (status === 'error') {
          toast(error)
        }
        if (result === 'fail') {
          setState({ status: 'error', message: feedback ?? '' })
        }
        if (result === 'check') {
          setState({ status: 'check' })
        }
      }
    }
  }, [exerciseId, checkExerciseFunctionRef, setState])

  return (
    <form action={() => checkExerciseFunction()} className='w-full'>
      <Input
        autoFocus
        ref={inputRef}
        placeholder={answerExample ? `Ej.: ${answerExample}` : 'Tu respuesta...'}
      />
    </form>
  )
}
