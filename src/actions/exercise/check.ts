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

  const newScore = (currentProgress.score ?? 0) + 10
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
      correctAnswer?: string
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
  if (!session) return { status: 'error', error: 'No has iniciado sesión' }

  const [exercise, exercisesList] = await Promise.all([
    prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { answer: true, failedFeedback: true }
    }),
    prisma.lessonExercise.findMany({
      select: { exerciseId: true },
      where: { lessonId },
      orderBy: { position: 'asc' }
    })
  ])

  if (!exercise) return { status: 'error', error: 'No se ha encontrado el ejercicio' }
  if (exercisesList.length === 0) {
    return { status: 'error', error: 'No se ha encontrado la lección' }
  }

  const currentIndex = exercisesList.findIndex(e => e.exerciseId === exerciseId)

  const currentProgressPromise = prisma.userExerciseProgress.findFirst({
    where: { userId: session.user.id, exerciseId }
  })

  let prevProgressPromise: Promise<{ completed: boolean } | null> | undefined
  if (currentIndex > 0) {
    const prevExerciseId = exercisesList[currentIndex - 1].exerciseId
    prevProgressPromise = prisma.userExerciseProgress.findFirst({
      where: { userId: session.user.id, exerciseId: prevExerciseId }
    })
  }

  const [currentProgress, prevProgress] = await Promise.all([
    currentProgressPromise,
    prevProgressPromise
  ])

  if (currentIndex > 0 && !prevProgress?.completed) {
    return { status: 'error', error: 'Debes de completar el anterior ejercicio antes' }
  }

  const isCorrect = answer === exercise.answer

  const { finalScore, attempts, correctAnswer } = await prisma.$transaction(async tx => {
    const exerciseProgress = await handleExerciseProgress(tx, {
      session,
      exerciseId,
      currentProgress,
      isCorrect
    })

    if (exerciseProgress.completed) {
      await handleLessonProgress(tx, {
        session,
        lessonId,
        lastExercise: currentIndex === exercisesList.length - 1
      })
    }

    return {
      finalScore: exerciseProgress.score ?? 0,
      attempts: exerciseProgress.attempts,
      correctAnswer: exercise.answer
    }
  })

  return isCorrect
    ? { status: 'ok', result: 'check', score: finalScore }
    : {
        status: 'ok',
        result: 'fail',
        feedback: exercise.failedFeedback,
        score: finalScore,
        correctAnswer: attempts >= 2 ? correctAnswer : undefined
      }
}
