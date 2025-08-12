import exercises from '@/components/exercises'
import MarkdownRenderer from '@/components/markdown/markdown-renderer'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

type TheoryPageProps = {
  params: Promise<{ itineraryId: string; lessonId: string; exerciseId: string }>
}

export default async function TheoryPage({ params }: TheoryPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return 'No has iniciado sesión'

  const { exerciseId, lessonId } = await params

  const exercise = await prisma.exercise.findFirst({ where: { id: exerciseId } })
  if (!exercise) notFound()

  const exercisesList = await prisma.lessonExercise.findMany({
    where: { lessonId },
    include: { exercise: true },
    orderBy: { position: 'asc' }
  })

  console.log(exercisesList)
  const previousExercise =
    exercisesList[exercisesList.findIndex(e => e.exerciseId === exerciseId) - 1]
  const previousExerciseProgress =
    previousExercise &&
    (await prisma.userExerciseProgress.findFirst({
      where: { exerciseId: previousExercise.exercise.id, userId: session.user.id },
      select: { completed: true }
    }))

  if (previousExercise && !previousExerciseProgress?.completed) {
    return 'Todavía no has desbloqueado este ejercicio'
  }

  const ExerciseComponent = exercises[exercise.type]

  return (
    <>
      <h1 className='[&>*]:text-xl'>
        <MarkdownRenderer content={exercise.title} inline />
      </h1>
      <ExerciseComponent
        lessonId={lessonId}
        exerciseId={exercise.id}
        answerExample={exercise.answerExample}
        options={exercise.multiple_choice_options}
      />
    </>
  )
}
