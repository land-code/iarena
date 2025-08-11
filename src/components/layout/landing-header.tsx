import { MenuIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import Link from 'next/link'
import IArenaIcon from '../icons/iarena'
import { SidebarNavLink, TopBarNavLink } from './nav-link'
import { APP_NAME } from '@/consts/app'
import { UI } from '@/consts/ui'

type Link = {
  label: string
  path: string
}

const LINKS: Link[] = [
  {
    label: 'Inicio',
    path: '/'
  },
  {
    label: UI.signIn,
    path: '/sign-in'
  },
  {
    label: UI.signUp,
    path: '/sign-up'
  }
]

export default function LandingHeader() {
  return (
    <header className='bg-primary/5 sticky top-0 left-1/2 z-50 flex h-20 w-max max-w-2xl shrink-0 -translate-x-1/2 items-center rounded-full px-4 backdrop-blur-lg md:px-6'>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant='outline' size='icon' className='mr-6 sm:hidden'>
            <MenuIcon className='h-6 w-6' />
            <span className='sr-only'>Abrir/cerrar el menú de navegación</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left'>
          <SheetHeader>
            <SheetTitle asChild>
              <Link href='/' className='mr-6 sm:hidden' prefetch={false}>
                <IArenaIcon />
                <span className='sr-only'>{APP_NAME}</span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className='grid gap-2'>
            {LINKS.map(({ path, label }) => (
              <SidebarNavLink key={path} path={path} label={label} />
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <Link href='/' className='mr-6 sm:flex' prefetch={false}>
        <IArenaIcon />
        <span className='sr-only'>{APP_NAME}</span>
      </Link>
      <nav className='ml-auto hidden gap-6 sm:flex'>
        {LINKS.map(({ path, label }) => (
          <TopBarNavLink key={path} path={path} label={label} />
        ))}
      </nav>
    </header>
  )
}
