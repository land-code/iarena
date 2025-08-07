import ProjectsList from '@/components/projects/projects-list'

export default function DashboardPage() {
  return (
    <div className='flex w-full flex-col gap-8 px-4'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold'>Itinerarios IArena</h1>
        <p className='text-muted-foreground'>
          Explora nuestros itinerarios de aprendizaje personalizados
        </p>
      </div>
      <ProjectsList />
    </div>
  )
}
