'use server'

import { z } from 'zod'
import { ActionState } from '../types'
import { es } from 'zod/v4/locales'
import { generateItinerary } from '@/ai/generate'
import { CourseSchema } from '@/ai/prompts/itinerary-prompt'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import pdf2md from '@opendocsg/pdf2md'

const pdfFileSchema = z.instanceof(File).refine(file => file.type === 'application/pdf', {
  message: 'The file must be a PDF'
})

const ItinerarySchema = z.object({
  text: z
    .string({ error: 'Es obligatorio describir el itinerario' })
    .min(10, 'La descripción debe de tener al menos 10 caracteres'),
  file: pdfFileSchema
})

z.config(es())

export async function createItinerary(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  const userId = session.user.id

  console.log(formData.get('file'))

  const parsed = ItinerarySchema.safeParse({
    text: formData.get('text'),
    file: formData.get('file')
  })
  if (!parsed.success) {
    return {
      status: 'error',
      error: parsed.error.issues[0].message
    }
  }

  const { text, file } = parsed.data

  let inputText = text

  if (file) {
    try {
      const arrayBuffer = await file.arrayBuffer()

      const content = await pdf2md(arrayBuffer)

      const summary = await import('node-summary').then(m => m.default || m)
      const sum = await new Promise<string>((resolve, reject) => {
        summary.summarize('Documento', content, (err, res) => {
          if (err) reject(err)
          else resolve(res)
        })
      })

      inputText += sum

      console.log()
    } catch (err) {
      console.error('Error extracting PDF text: ', err)
      return {
        status: 'error',
        error: 'Error al extraer texto del PDF'
      }
    }
  }

  const itinerary = await generateItinerary(inputText)
  if (!itinerary) {
    return {
      status: 'error',
      error: 'Se ha producido un error al generar el itinerario'
    }
  }

  let result: z.infer<typeof CourseSchema> | null = null

  try {
    result = CourseSchema.parse(JSON.parse(itinerary))
  } catch (e) {
    if (e instanceof Error) {
      console.warn(e.message)
    }
    console.warn(e)
    return {
      status: 'error',
      error:
        'La IA a veces se confunde. Prueba de nuevo o cambia la descripción, y si el problema persiste avisa al administrador.'
    }
  }

  const { title, description, subject, course, difficulty, content } = result

  try {
    await prisma.$transaction(async tx => {
      const itineraryCreated = await tx.itinerary.create({
        data: {
          title,
          description,
          subject,
          course,
          difficulty,
          ownerId: userId
        }
      })

      const lessonsCreated = await Promise.all(
        content.map(({ title, description, summary }) =>
          tx.lesson.create({
            data: {
              title,
              description,
              summary,
              generated: false,
              ownerId: userId
            }
          })
        )
      )

      await tx.itineraryLesson.createMany({
        data: lessonsCreated.map((lesson, index) => ({
          lessonId: lesson.id,
          itineraryId: itineraryCreated.id,
          position: index
        }))
      })
    })
  } catch (error) {
    console.log(error)
    return {
      status: 'error',
      error: 'Se ha producido un error al guardar el itinerario'
    }
  }

  revalidatePath('/dashboard')

  return { status: 'success' }
}
