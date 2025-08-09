'use client'

import { useNavFooter } from '@/contexts/nav-footer'
import { useEffect, useState } from 'react'
import { checkExercise } from '@/actions/exercise/check'
import { Card } from '../ui/card'
import { toast } from 'sonner'

type MultipleChoiceProps = {
  exerciseId: string
  options: string[]
}

export default function MultipleChoice({ exerciseId, options }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const { checkExerciseFunctionRef, setState } = useNavFooter()

  useEffect(() => {
    checkExerciseFunctionRef.current = async () => {
      if (!selected) return toast('Debes escoger una opción')
      const { status, error, result, feedback } = await checkExercise(exerciseId, selected)
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
  }, [exerciseId, setState, checkExerciseFunctionRef, selected])

  return (
    <div className='grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      {options.map(option => (
        <Card
          key={option}
          onClick={() => setSelected(option)}
          className={`cursor-pointer rounded-md border p-4 ${
            selected === option ? 'border-accent-foreground bg-accent' : 'border-gray-300'
          }`}
        >
          {option}
        </Card>
      ))}
    </div>
  )
}
