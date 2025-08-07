import NewProject from '@/components/projects/new-project'
import ProjectsList from '@/components/projects/projects-list'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { UI } from '@/consts/ui'
import { PlusIcon } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className='flex w-full flex-col gap-8 px-4'>
      <div className='flex justify-between'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-bold'>Itinerarios IArena</h1>
          <p className='text-muted-foreground'>
            Explora nuestros itinerarios de aprendizaje personalizados
          </p>
        </div>
        <Dialog>
          <Button asChild>
            <DialogTrigger>
              <PlusIcon />
              {UI.newItinerarie}
            </DialogTrigger>
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{UI.newItinerarie}</DialogTitle>
              <DialogDescription>
                Introduce la descripción del contenido para que lo genere la IA. También puedes
                subir un PDF y generarlo a partir de ahí
              </DialogDescription>
            </DialogHeader>
            <NewProject />
          </DialogContent>
        </Dialog>
      </div>
      <ProjectsList />
    </div>
  )
}
