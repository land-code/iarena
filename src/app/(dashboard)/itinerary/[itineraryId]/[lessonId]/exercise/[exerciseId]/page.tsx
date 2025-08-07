import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

type TheoryPageProps = {
  params: Promise<{ itineraryId: string; lessonId: string; exerciseId: string }>
}

export default async function TheoryPage({ params }: TheoryPageProps) {
  const { exerciseId } = await params

  const exercise = await prisma.exercise.findFirst({ where: { id: exerciseId } })
  if (!exercise) notFound()
  return (
    <>
      <h1 className='text-3xl'>{exercise.title}</h1>
      <p>{exercise.type}</p>
    </>
  )
}
