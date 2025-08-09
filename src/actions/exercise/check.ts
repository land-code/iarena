'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

export const checkExercise = async (exerciseId: string, answer: string) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { status: 'error', error: 'No hay sesión' }

  const exercise = await prisma.exercise.findFirst({ where: { id: exerciseId } })
  if (!exercise) return { status: 'error', error: 'No se ha encontrado el ejercicio' }

  const { title, answer: correctAnswer, failedFeedback } = exercise
  console.log(title, correctAnswer, failedFeedback)

  return answer === correctAnswer
    ? { status: 'ok', result: 'check' }
    : { status: 'ok', result: 'fail', feedback: failedFeedback }
}
