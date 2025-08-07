import ItineraryLesson from '@/components/itinerary-map/itinerary-lesson'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

type ItineraryPageProps = {
  params: Promise<{ itineraryId: string }>
}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const { itineraryId } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return notFound()
  const userId = session.user.id

  const itinerary = await prisma.itinerary.findFirst({
    where: {
      id: itineraryId,
      ownerId: userId
    },
    include: {
      lessons: {
        orderBy: {
          position: 'asc'
        },
        include: {
          lesson: true
        }
      }
    }
  })

  if (!itinerary) return notFound()

  return (
    <div className='flex w-full flex-col items-center gap-4 px-4'>
      <div>
        <h1 className='text-semibold text-2xl'>{itinerary.title}</h1>
        <p className='text-muted-foreground font-light'>{itinerary.description}</p>
      </div>
      <div className='flex w-full flex-col gap-24'>
        {itinerary.lessons.map(({ lesson: { id, title } }, index) => (
          <ItineraryLesson
            completed={false}
            locked={false}
            current={false}
            index={index}
            title={title}
            href={`/itinerary/${itineraryId}/${id}`}
            key={id}
          />
        ))}
      </div>
    </div>
  )
}
