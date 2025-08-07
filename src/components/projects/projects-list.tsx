import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import ItineraryCard from './itinerary-card'

export default async function ProjectsList() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return 'No has iniciado sesión'
  }

  const userId = session.user.id

  const itineraries = await prisma.itinerary.findMany({
    include: {
      _count: {
        select: {
          lessons: true
        }
      }
    },
    where: {
      ownerId: userId
    }
  })

  return (
    <ul className='flex flex-col gap-4'>
      {itineraries.map(({ id, title, description, course, subject, difficulty, _count }) => (
        <ItineraryCard
          key={id}
          title={title}
          description={description}
          href={`/itinerary/${id}`}
          course={course}
          subject={subject}
          difficulty={difficulty}
          lessonCount={_count.lessons}
        />
      ))}
    </ul>
  )
}
