'use server'

import { z } from 'zod'
import { ActionState } from '../types'
import { es } from 'zod/v4/locales'
import { generateLesson as aiGenerateLesson } from '@/ai/generate'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { FullContentSchema } from '@/ai/prompts/lesson-prompt'

const GenerateLessonSchema = z.object({
  lessonId: z.uuid()
})

z.config(es())

export async function generateLesson(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const parsed = GenerateLessonSchema.safeParse({
    lessonId: formData.get('lesson-id')
  })
  if (!parsed.success) {
    return {
      status: 'error',
      error:
        'No se ha podido identificar la lección. Prueba de nuevo, y si el problema persiste contacta con el administrador'
    }
  }

  const { lessonId } = parsed.data
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId },
    select: { summary: true }
  })
  if (!lesson) {
    return {
      status: 'error',
      error:
        'No se ha podido identificar la lección. Prueba de nuevo, y si el problema persiste contacta con el administrador'
    }
  }

  const itinerary = await aiGenerateLesson(lesson.summary)
  if (!itinerary) {
    return {
      status: 'error',
      error: 'Se ha producido un error al generar la lección'
    }
  }

  console.log(itinerary)

  let result = null

  try {
    result = FullContentSchema.parse(JSON.parse(itinerary))
  } catch (error) {
    console.log(error)
    return {
      status: 'error',
      error:
        'La IA a veces se confunde. Prueba de nuevo o cambia la descripción, y si el problema persiste avisa al administrador.'
    }
  }

  const { a_theories: theories, b_exercises: exercises, z_order: order } = result

  try {
    await prisma.$transaction(async tx => {
      const positionedTheories = theories
        .map((theorie, i) => ({
          ...theorie,
          position: order.findIndex(({ source, index }) => source === 'theory' && index === i) + 1
        }))
        .filter(theorie => theorie.position !== -1)

      const positionedExercises = exercises
        .map((exercise, i) => ({
          ...exercise,
          position:
            order.findIndex(({ source, index }) => source === 'exercises' && index === i) + 1
        }))
        .filter(exercise => exercise.position !== -1)

      const theoriesCreated = await Promise.all(
        positionedTheories.map(({ title, content }) =>
          tx.theory.create({ data: { title, content } })
        )
      )

      const exercisesCreated = await Promise.all(
        positionedExercises.map(({ title, exercise_type }) =>
          tx.exercise.create({ data: { title, type: exercise_type } })
        )
      )

      await tx.lessonTheory.createMany({
        data: theoriesCreated.map(({ id: theoryId }, index) => ({
          theoryId,
          lessonId,
          position: positionedTheories[index].position ?? -1
        }))
      })

      await tx.lessonExercise.createMany({
        data: exercisesCreated.map(({ id: exerciseId }, index) => ({
          exerciseId,
          lessonId,
          position: positionedExercises[index].position ?? -1
        }))
      })

      await tx.lesson.update({ where: { id: lessonId }, data: { generated: true } })
    })
  } catch (error) {
    console.log(error)
    return {
      status: 'error',
      error: 'Se ha producido un error mientras se guardaban los ejercicios y las teorías'
    }
  }

  revalidatePath('/dashboard')

  return { status: 'success' }
}
