'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

type CheckExerciseResult =
  | {
      status: 'ok'
      result: 'check'
      score: number
    }
  | {
      status: 'ok'
      result: 'fail'
      feedback: string
      score: number
    }
  | {
      status: 'error'
      error: string
    }

export const checkExercise = async (
  exerciseId: string,
  answer: string
): Promise<CheckExerciseResult> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { status: 'error', error: 'No hay sesión' }

  const exercise = await prisma.exercise.findFirst({ where: { id: exerciseId } })
  if (!exercise) return { status: 'error', error: 'No se ha encontrado el ejercicio' }

  const { answer: correctAnswer, failedFeedback } = exercise

  const isCorrect = answer === correctAnswer

  let finalScore = 0

  const currentProgress = await prisma.userExerciseProgress.findFirst({
    where: {
      userId: session.user.id,
      exerciseId
    }
  })

  await prisma.$transaction(async tx => {
    if (currentProgress) {
      const newAttempts = (currentProgress.attempts ?? 0) + 1

      if (currentProgress.completed) {
        finalScore = currentProgress.score ?? 10
        return
      }

      if (isCorrect) {
        const updated = await tx.userExerciseProgress.update({
          where: { id: currentProgress.id },
          data: {
            attempts: newAttempts,
            score: (currentProgress.score ?? 0) + 10 * newAttempts,
            completed: true
          }
        })
        finalScore = updated.score ?? 0
      } else {
        const updated = await tx.userExerciseProgress.update({
          where: { id: currentProgress.id },
          data: {
            attempts: newAttempts,
            score: (currentProgress.score ?? 0) - 5 * newAttempts,
            completed: false
          }
        })
        finalScore = updated.score ?? 0
      }
    } else {
      const created = await tx.userExerciseProgress.create({
        data: {
          userId: session.user.id,
          exerciseId,
          attempts: 1,
          score: isCorrect ? 10 : -5,
          completed: isCorrect
        }
      })
      finalScore = created.score ?? 0
    }
  })

  return isCorrect
    ? { status: 'ok', result: 'check', score: finalScore }
    : { status: 'ok', result: 'fail', feedback: failedFeedback, score: finalScore }
}
