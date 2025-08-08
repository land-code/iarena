import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

type LastItineraryRedirectionProps = {
  params: Promise<{ itineraryId: string; lessonId: string }>
}

export default async function LastItineraryRedirection({ params }: LastItineraryRedirectionProps) {
  const { itineraryId, lessonId } = await params

  const [lastTheory, lastExercise] = await Promise.all([
    prisma.lessonTheory.findFirst({
      where: { lessonId },
      orderBy: { position: 'desc' },
      include: { theory: { select: { id: true } } }
    }),
    prisma.lessonExercise.findFirst({
      where: { lessonId },
      orderBy: { position: 'desc' },
      include: { exercise: { select: { id: true } } }
    })
  ])

  const lastType =
    !lastTheory || (lastExercise && lastExercise.position > lastTheory.position)
      ? 'exercise'
      : 'theory'
  const lastId = lastType === 'exercise' ? lastExercise?.exercise.id : lastTheory?.theory.id

  redirect(`/itinerary/${itineraryId}/${lessonId}/${lastType}/${lastId}`)
}
