import GenerateLesson from '@/components/lesson/generate-lesson'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

type LessonPageProps = {
  params: Promise<{ itineraryId: string; lessonId: string }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params

  const lesson = await prisma.lesson.findFirst({ where: { id: lessonId } })
  if (!lesson) notFound()

  return (
    <>
      <p className='text-muted-foreground max-w-prose leading-relaxed tracking-normal'>
        {lesson.description}
      </p>
      {!lesson.generated && <GenerateLesson lessonId={lessonId} />}
    </>
  )
}
