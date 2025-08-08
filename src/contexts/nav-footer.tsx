'use client'
import { useParams, useRouter } from 'next/navigation'
import { createContext, useState, ReactNode, Dispatch, SetStateAction, useContext } from 'react'

type State =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'check'; message?: string }

type NavFooterContextType = {
  state: State
  setState: Dispatch<SetStateAction<State>>
  position: number
  setPosition: (index: number) => void
  goNext: () => void
  goBack: () => void
  nextUrl: string
  backUrl: string
}

const NavFooterContext = createContext<NavFooterContextType | undefined>(undefined)

type LessonContent = {
  type: 'exercise' | 'theory'
  id: string
  position: number
}

type NavFooterProviderProps = {
  lessonContents: LessonContent[]
  children: ReactNode
}

export function NavFooterProvider({ lessonContents, children }: NavFooterProviderProps) {
  const [state, setState] = useState<State>({ status: 'idle' })

  const router = useRouter()
  const { itineraryId, lessonId, theoryId, exerciseId } = useParams<{
    itineraryId: string
    lessonId: string
    theoryId?: string
    exerciseId?: string
  }>()

  const position = lessonContents.find(c => c.id === theoryId || c.id === exerciseId)?.position ?? 0

  const getUrl = (position: number) => {
    const content = lessonContents.find(c => c.position === position)
    if (!content) return '#'
    const { id, type } = content
    return `/itinerary/${itineraryId}/${lessonId}/${type}/${id}`
  }

  const nextUrl = getUrl(position + 1)
  const backUrl = getUrl(position - 1)

  const setPosition = (position: number) => {
    router.push(getUrl(position))
  }

  const goNext = () => {
    setPosition(position + 1)
  }

  const goBack = () => {
    setPosition(position - 1)
  }

  return (
    <NavFooterContext.Provider
      value={{ state, setState, position, setPosition, goNext, goBack, backUrl, nextUrl }}
    >
      {children}
    </NavFooterContext.Provider>
  )
}

export function useNavFooter() {
  const context = useContext(NavFooterContext)
  if (!context) throw new Error('useNavFooter must be used within NavFooterProvider')
  return context
}
