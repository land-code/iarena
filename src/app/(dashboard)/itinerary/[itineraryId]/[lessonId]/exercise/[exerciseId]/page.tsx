import exercises from '@/components/exercises'
import MarkdownRenderer from '@/components/markdown/markdown-renderer'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

type TheoryPageProps = {
  params: Promise<{ itineraryId: string; lessonId: string; exerciseId: string }>
}

export default async function TheoryPage({ params }: TheoryPageProps) {
  const { exerciseId } = await params

  const exercise = await prisma.exercise.findFirst({ where: { id: exerciseId } })
  if (!exercise) notFound()

  const ExerciseComponent = exercises[exercise.type]
  return (
    <>
      <h1 className='[&>*]:text-xl'>
        <MarkdownRenderer content={exercise.title} inline />
      </h1>
      <ExerciseComponent exerciseId={exercise.id} />
    </>
  )
}
