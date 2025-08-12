'use client'

import { useNavFooter } from '@/contexts/nav-footer'
import { Input } from '../ui/input'
import { useEffect, useRef } from 'react'
import { checkExercise } from '@/actions/exercise/check'
import { toast } from 'sonner'

type ShortAnswerProps = {
  exerciseId: string
  answerExample: string | null
  lessonId: string
}

export default function ShortAnswer({ exerciseId, answerExample, lessonId }: ShortAnswerProps) {
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
        const res = await checkExercise({
          exerciseId,
          answer: inputRef.current?.value ?? '',
          lessonId
        })
        if (res.status === 'error') {
          toast(res.error)
          return
        }
        if (res.result === 'fail') {
          setState({
            status: 'error',
            message: `${res.feedback} ${res.correctAnswer ? `\nRespuesta correcta: ${res.correctAnswer}` : ''}`
          })
        }
        if (res.result === 'check') {
          setState({ status: 'check' })
        }

        setPoints(res.score)
      }
    }
  }, [exerciseId, checkExerciseFunctionRef, setState, setPoints, lessonId])

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
