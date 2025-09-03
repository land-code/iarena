'use client'

import { useNavFooter } from '@/contexts/nav-footer'
import { useEffect, useState } from 'react'
import { checkExercise } from '@/actions/exercise/check'
import { toast } from 'sonner'

type MultipleChoiceProps = {
  exerciseId: string
  options: string[]
  lessonId: string
}

export default function MultipleChoice({ exerciseId, options, lessonId }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const {
    checkExercise: checkExerciseFunction,
    checkExerciseFunctionRef,
    setState,
    setPoints
  } = useNavFooter()

  useEffect(() => {
    checkExerciseFunctionRef.current = async () => {
      if (!selected) return toast('Debes escoger una opción')
      const res = await checkExercise({ exerciseId, answer: selected, lessonId })
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
  }, [exerciseId, setState, checkExerciseFunctionRef, selected, setPoints, lessonId])

  return (
    <form
      action={() => checkExerciseFunction()}
      className='grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    >
      {options.map(option => (
        <label
          key={option}
          className={`hover:bg-accent flex cursor-pointer rounded-md border p-4 ${
            selected === option ? 'border-accent-foreground bg-accent' : 'border-gray-300'
          }`}
          tabIndex={0}
          onKeyDown={e => {
            if (e.code === 'Enter' || e.code === 'Space') {
              setSelected(option)
            }
          }}
          onClick={() => setSelected(option)}
        >
          <input
            type='radio'
            name='multiple-choice'
            checked={selected === option}
            onClick={() => setSelected(option)}
            className='sr-only'
            tabIndex={-1}
            readOnly
          />
          <span>{option}</span>
        </label>
      ))}
    </form>
  )
}
