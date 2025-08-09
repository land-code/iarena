'use client'

import { useNavFooter } from '@/contexts/nav-footer'
import { Input } from '../ui/input'
import { useEffect, useRef } from 'react'
import { checkExercise } from '@/actions/exercise/check'

type ShortAnswerProps = {
  exerciseId: string
}

export default function ShortAnswer({ exerciseId }: ShortAnswerProps) {
  const { checkExerciseFunctionRef, setState } = useNavFooter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      checkExerciseFunctionRef.current = async () => {
        const { status, result, feedback } = await checkExercise(
          exerciseId,
          inputRef.current?.value ?? ''
        )
        console.log(status, result, feedback)
        if (result === 'fail') {
          setState({ status: 'error', message: feedback ?? '' })
        }
        if (result === 'check') {
          setState({ status: 'check' })
        }
      }
    }
  }, [exerciseId, checkExerciseFunctionRef, setState])

  return <Input ref={inputRef} placeholder='Tu respuesta...' />
}
