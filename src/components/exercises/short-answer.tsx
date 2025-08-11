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
    setState,
    setPoints
  } = useNavFooter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      checkExerciseFunctionRef.current = async () => {
        const res = await checkExercise(exerciseId, inputRef.current?.value ?? '')
        if (res.status === 'error') {
          toast(res.error)
          return
        }
        if (res.result === 'fail') {
          setState({ status: 'error', message: res.feedback ?? '' })
        }
        if (res.result === 'check') {
          setState({ status: 'check' })
        }

        setPoints(res.score)
      }
    }
  }, [exerciseId, checkExerciseFunctionRef, setState, setPoints])

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
