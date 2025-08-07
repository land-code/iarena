import { Type } from '@google/genai'
import { Prompt } from './types'
import z from 'zod'

export const ContentItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  summary: z.string()
})

export const CourseSchema = z.object({
  title: z.string(),
  description: z.string(),
  subject: z.string(),
  course: z.string(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'ADVANCED']),
  content: z.array(ContentItemSchema)
})

export const itineraryPrompt: Prompt = {
  model: 'gemini-2.5-flash',
  config: {
    thinkingConfig: { thinkingBudget: 0 },
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ['title', 'description', 'subject', 'course', 'difficulty', 'content'],
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        subject: { type: Type.STRING },
        course: { type: Type.STRING },
        difficulty: {
          type: Type.STRING,
          enum: ['EASY', 'MEDIUM', 'ADVANCED']
        },
        content: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['title', 'description', 'summary'],
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              summary: { type: Type.STRING }
            }
          }
        }
      }
    },
    systemInstruction: [
      {
        text: `Genera un itinerario de 5 lecciones para aprender lo que el usuario indique. Indica el título de cada lección, una breve descripción (1-2 frases) y un summary que será lo que la siguiente IA tenga para generar la lección. Se preciso con el summary. Nivel: Bach 2º.

El usuario ha indicado:`
      }
    ]
  }
}
