'use server'

import type { Prisma, UserExerciseProgress, UserLessonProgress } from '@/generated/prisma'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

type PrismaTransactionalClient = Prisma.TransactionClient

type HandleExerciseProgressParams = {
  session: { user: { id: string } }
  exerciseId: string
  currentProgress: UserExerciseProgress | null
  isCorrect: boolean
}

type HandleLessonProgressParams = {
  session: { user: { id: string } }
  lessonId: string
  lastExercise: boolean
}

async function handleExerciseProgress(
  tx: PrismaTransactionalClient,
  { session, exerciseId, currentProgress, isCorrect }: HandleExerciseProgressParams
): Promise<UserExerciseProgress> {
  const now = new Date().toISOString()

  if (!currentProgress) {
    return await tx.userExerciseProgress.create({
      data: {
        userId: session.user.id,
        exerciseId,
        attempts: 1,
        score: isCorrect ? 10 : -5,
        completed: isCorrect,
        completedAt: isCorrect ? now : null
      }
    })
  }

  if (currentProgress.completed) {
    return currentProgress
  }

  const newAttempts = (currentProgress.attempts ?? 0) + 1

  if (!isCorrect) {
    const newScore = (currentProgress.score ?? 0) - 5
    return await tx.userExerciseProgress.update({
      where: { id: currentProgress.id },
      data: {
        attempts: newAttempts,
        score: newScore,
        completed: false
      }
    })
  }

  const newScore = (currentProgress.score ?? 0) + 10 * newAttempts

  return await tx.userExerciseProgress.update({
    where: { id: currentProgress.id },
    data: {
      attempts: newAttempts,
      score: newScore,
      completed: true,
      completedAt: now
    }
  })
}

async function handleLessonProgress(
  tx: PrismaTransactionalClient,
  { session, lessonId, lastExercise }: HandleLessonProgressParams
): Promise<UserLessonProgress | void> {
  if (lastExercise) {
    const now = new Date().toISOString()
    return await tx.userLessonProgress.create({
      data: {
        userId: session.user.id,
        lessonId,
        completed: true,
        completedAt: now
      }
    })
  }
}

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

export const checkExercise = async ({
  exerciseId,
  answer,
  lessonId
}: {
  exerciseId: string
  answer: string
  lessonId: string
}): Promise<CheckExerciseResult> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { status: 'error', error: 'No hay sesión' }

  const exercise = await prisma.exercise.findFirst({ where: { id: exerciseId } })
  if (!exercise) return { status: 'error', error: 'No se ha encontrado el ejercicio' }

  const lastExercise = await prisma.lessonExercise.findFirst({
    select: { exerciseId: true },
    where: { lessonId: lessonId },
    orderBy: { position: 'desc' }
  })
  if (!lastExercise) return { status: 'error', error: 'No se ha encontrado la lección' }

  const { answer: correctAnswer, failedFeedback } = exercise

  const isCorrect = answer === correctAnswer

  const currentProgress = await prisma.userExerciseProgress.findFirst({
    where: {
      userId: session.user.id,
      exerciseId
    }
  })

  const finalScore = await prisma.$transaction(async tx => {
    const exerciseProgress = await handleExerciseProgress(tx, {
      session,
      exerciseId,
      currentProgress,
      isCorrect
    })

    if (exerciseProgress.completed) {
      await handleLessonProgress(tx, { session, lessonId, lastExercise: Boolean(lastExercise) })
    }

    return exerciseProgress.score ?? 0
  })

  return isCorrect
    ? { status: 'ok', result: 'check', score: finalScore }
    : { status: 'ok', result: 'fail', feedback: failedFeedback, score: finalScore }
}
