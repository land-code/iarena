import { UI } from '@/consts/ui'
import { Button } from '../ui/button'
import ArenaAnimation from './arena-animation'

export default function Hero() {
  return (
    <section className='flex min-h-[calc(100vh-5rem)] max-w-xl flex-col items-center justify-center gap-8 text-center supports-[height:100dvh]:min-h-[calc(100dvh-5rem)]'>
      <ArenaAnimation />
      <p className='text-muted-foreground text-xl font-light'>
        Una arena digital para dominar conocimientos combinando teoría, práctica y desafíos con IA.
      </p>
      <Button disabled>{UI.comingSoon}</Button>
    </section>
  )
}
