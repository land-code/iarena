import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

type LessonPageProps = {
  params: Promise<{ lessonId: string; itineraryId: string }>
  children: React.ReactNode
}

export default async function LessonPage({ params, children }: LessonPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const { lessonId, itineraryId } = await params
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId },
    include: {
      theories: {
        orderBy: { position: 'asc' },
        include: {
          theory: true
        }
      },
      exercises: {
        orderBy: { position: 'asc' },
        include: { exercise: true }
      }
    }
  })

  if (!lesson) notFound()

  const itinerary = await prisma.itinerary.findFirst({
    where: { id: itineraryId },
    include: { lessons: { select: { lessonId: true, position: true } } }
  })

  const lessonPosition = itinerary?.lessons.find(l => l.lessonId === lessonId)?.position

  const content = [
    ...lesson.theories.map(t => ({
      type: 'theory',
      position: t.position,
      data: t.theory
    })),
    ...lesson.exercises.map(e => ({
      type: 'exercise',
      position: e.position,
      data: e.exercise
    }))
  ].toSorted((a, b) => a.position - b.position)

  return (
    <>
      <header className='bg-accent flex w-full items-center gap-4 p-4'>
        <div className='bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full text-3xl'>
          {lessonPosition}
        </div>
        <div className='flex flex-1 flex-col items-start md:flex-row md:items-center md:justify-between'>
          <span className='text-2xl'>{lesson.title}</span>
          {content.length > 0 && (
            <DropdownMenu>
              <Button variant='ghost' asChild>
                <DropdownMenuTrigger>Ir a...</DropdownMenuTrigger>
              </Button>
              <DropdownMenuContent>
                {content.map(content => (
                  <DropdownMenuItem asChild key={content.data.id}>
                    <Link
                      href={`/itinerary/${itineraryId}/${lessonId}/${content.type}/${content.data.id}`}
                      prefetch={false}
                    >
                      {lessonPosition}.{content.position} {content.data.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className='flex w-full max-w-3xl flex-1 flex-col items-center gap-4 p-4'>
        {children}
      </main>
      <footer className='bg-accent flex w-full items-center justify-between p-4'>
        <Button variant='secondary'>{'<-'} Anterior</Button>
        <Button>Siguiente {'->'}</Button>
      </footer>
    </>
  )
}
