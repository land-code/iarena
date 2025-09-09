'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState, useState } from 'react'
import { UI } from '@/consts/ui'
import { createItinerary } from '@/actions/itinerary/create'

export default function NewItinerarie() {
  const [text, setText] = useState('')
  const [pdfFiles, setPdfFiles] = useState<FileList | null>(null)

  const [state, action] = useActionState(createItinerary, { status: 'idle' })

  return (
    <form action={action} className='mt-4 space-y-4'>
      {/* TAB DE TEXTO */}
      <div className='mt-4 space-y-4'>
        <Label htmlFor='itinerary-text'>Descripción del itinerario</Label>
        <Textarea
          required
          name='text'
          minLength={10}
          id='itinerary-text'
          placeholder='Escribe aquí el itinerario...'
          value={text}
          onChange={e => setText(e.target.value)}
          className='min-h-[200px]'
        />
      </div>

      {/* TAB DE PDF */}
      <div className='mt-4 space-y-4'>
        <Label htmlFor='pdf-upload'>Archivo PDF (opcional)</Label>
        <Input
          id='pdf-upload'
          type='file'
          accept='application/pdf'
          name='file'
          multiple
          onChange={e => setPdfFiles(e.target.files)}
        />
      </div>

      <p className='text-destructive'>{state.status === 'error' && state.error}</p>
      <Button type='submit'>{UI.createItinerarie}</Button>
    </form>
  )
}
