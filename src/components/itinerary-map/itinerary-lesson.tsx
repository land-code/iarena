import { CheckCircle2Icon, CircleIcon, LockIcon } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '../ui/badge'

type ItineraryLessonProps = {
  index: number
  title: string
  completed: boolean
  locked: boolean
  current: boolean
  href: string
}

// The order of array determines the order by groups of three
const POSITIONS = ['left', 'center', 'right']

export default function ItineraryLesson({
  index,
  title,
  completed,
  locked,
  current,
  href
}: ItineraryLessonProps) {
  const position = POSITIONS[index % 3]
  return (
    <div
      className={`relative flex flex-col items-center ${position === 'left' ? 'mr-auto ml-8' : ''} ${position === 'right' ? 'mr-8 ml-auto' : ''} ${position === 'center' ? 'mx-auto' : ''} `}
      style={{ width: 'fit-content' }}
    >
      <Link
        href={href}
        className={`focus:ring-primary/20 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 focus:scale-110 focus:ring-4 focus:outline-none ${
          completed
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
            : current
              ? 'bg-primary text-primary-foreground shadow-primary/25 ring-primary/20 shadow-lg ring-4'
              : locked
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground border-2 shadow-md'
        } `}
      >
        {completed ? (
          <CheckCircle2Icon className='h-5 w-5' />
        ) : locked ? (
          <LockIcon className='h-4 w-4' />
        ) : (
          <CircleIcon className='h-4 w-4 fill-current' />
        )}
      </Link>
      {/* Lesson Title */}
      <div className='mt-3 text-center'>
        <h3
          className={`text-sm font-medium transition-colors ${
            completed
              ? 'text-green-600 dark:text-green-400'
              : current
                ? 'text-primary font-semibold'
                : locked
                  ? 'text-muted-foreground'
                  : 'text-foreground hover:text-primary'
          } `}
        >
          {title}
        </h3>

        {current && (
          <Badge variant='default' className='mt-1 text-xs'>
            Actual
          </Badge>
        )}
      </div>
    </div>
  )
}
