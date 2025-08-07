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

  const handlePdfSubmit = () => {
    if (!pdfFiles) return
    const formData = new FormData()
    Array.from(pdfFiles).forEach(file => {
      formData.append('pdfs', file)
    })

    // Aquí puedes enviar formData a tu backend
    console.log('PDFs enviados:', pdfFiles)
  }

  return (
    <Tabs defaultValue='text' className='mx-auto w-full max-w-2xl'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='text'>Texto</TabsTrigger>
        <TabsTrigger value='pdf'>Subir PDFs</TabsTrigger>
      </TabsList>

      {/* TAB DE TEXTO */}
      <TabsContent value='text'>
        <form action={action} className='mt-4 space-y-4'>
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
          <p className='text-destructive'>{state.status === 'error' && state.error}</p>
          <Button type='submit'>{UI.createItinerarie}</Button>
        </form>
      </TabsContent>

      {/* TAB DE PDF */}
      <TabsContent value='pdf'>
        <div className='mt-4 space-y-4'>
          <Label htmlFor='pdf-upload'>Sube uno o varios archivos PDF</Label>
          <Input
            id='pdf-upload'
            type='file'
            accept='application/pdf'
            multiple
            onChange={e => setPdfFiles(e.target.files)}
          />
          <Button onClick={handlePdfSubmit} disabled={!pdfFiles?.length}>
            Subir PDF(s)
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}
