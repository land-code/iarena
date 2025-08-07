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
  params: Promise<{ lessonId: string }>
  children: React.ReactNode
}

export default async function LessonPage({ params, children }: LessonPageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const { lessonId } = await params
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
      },
      itineraryLessons: {
        select: {
          position: true
        }
      }
    }
  })

  if (!lesson) notFound()

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
    <div className='flex w-full flex-col'>
      <header className='bg-accent flex w-full items-center gap-4 p-4'>
        <div className='bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full text-3xl'>
          {lesson.itineraryLessons[0].position}
        </div>
        <div className='flex flex-1 flex-col md:flex-row md:justify-between'>
          <h1 className='text-2xl'>{lesson.title}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger className='w-max'>Ir a...</DropdownMenuTrigger>
            <DropdownMenuContent>
              {content.map(content => (
                <DropdownMenuItem asChild key={content.data.id}>
                  <Link
                    href={`/lesson/${lessonId}/${content.type}/${content.data.id}`}
                    prefetch={false}
                  >
                    {content.data.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
