import { getLessonDifficultyLabel } from '@/consts/lesson'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { GraduationCapIcon, MoreVerticalIcon, TrendingUpIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Difficulty } from '@/generated/prisma'
import Link from 'next/link'

type ItineraryCardProps = {
  title: string
  description: string
  course: string
  subject: string
  difficulty: (typeof Difficulty)[keyof typeof Difficulty]
  lessonCount: number
  href: string
}

const difficultyBadgeClassNames = {
  [Difficulty.EASY]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [Difficulty.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [Difficulty.ADVANCED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

export default function ItineraryCard({
  title,
  description,
  course,
  subject,
  difficulty,
  lessonCount,
  href
}: ItineraryCardProps) {
  const difficultyLabel = getLessonDifficultyLabel(difficulty)
  const difficultyBadgeClassName = difficultyBadgeClassNames[difficulty]

  return (
    <Link href={href}>
      <Card className='cursor-pointer transition-all hover:scale-105 hover:shadow-lg'>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {/* Círculo con número de lecciones*/}
            <div className='ml-3 flex-shrink-0'>
              <div className='bg-primary flex h-12 w-12 items-center justify-center rounded-full shadow-lg'>
                <span className='text-sm font-bold text-white'>{lessonCount}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='secondary' className='text-xs'>
                <GraduationCapIcon className='mr-1 h-3 w-3' />
                {course}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {subject}
              </Badge>
              <Badge className={`text-xs ${difficultyBadgeClassName}`}>
                <TrendingUpIcon className='mr-1 h-3 w-3' />
                {difficultyLabel}
              </Badge>
            </div>

            {/* Menú de opciones */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-dropdown-trigger>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreVerticalIcon className='h-4 w-4' />
                  <span className='sr-only'>Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem disabled>Marcar como favorito</DropdownMenuItem>
                <DropdownMenuItem disabled>Compartir</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Reportar problema</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
