import NavigationFooter from '@/components/lesson/navigation-footer'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

type TheoryPageProps = {
  params: Promise<{ itineraryId: string; lessonId: string; theoryId: string }>
}

export default async function TheoryPage({ params }: TheoryPageProps) {
  const { theoryId } = await params

  const theory = await prisma.theory.findFirst({ where: { id: theoryId } })
  if (!theory) notFound()
  return (
    <>
      <main className='flex w-full max-w-3xl flex-1 flex-col items-center gap-4 p-4'>
        <h1 className='text-3xl'>{theory.title}</h1>
        <p>{theory.content}</p>
      </main>
      <NavigationFooter />
    </>
  )
}
