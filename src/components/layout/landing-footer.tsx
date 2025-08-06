import Link from 'next/link'
import GitHubIcon from '../icons/github-icon'
import IArenaIcon from '../icons/iarena'

export default function LandingFooter() {
  return (
    <footer className='flex flex-col gap-4 px-4 pt-12 pb-4'>
      <div className='flex max-w-sm flex-col gap-2 text-sm'>
        <IArenaIcon />
        <p className='text-muted-foreground'>
          Un nuevo espacio de entrenamiento inteligente: con ejercicios y explicaciones
          personalizadas.
        </p>
        <Link
          href='github.com/land-code/iarena'
          target='_blank'
          rel='noopener noreferrer'
          className='text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors'
        >
          <GitHubIcon /> GitHub
        </Link>
      </div>
      <p className='text-muted-foreground text-sm'>© 2025 IArena</p>
    </footer>
  )
}
