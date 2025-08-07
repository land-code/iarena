import { Type } from '@google/genai'
import { Prompt } from './types'
import z from 'zod'

// ===================
// TEORÍA Y ORDEN
// ===================

const TheorySchema = z.object({
  title: z.string(),
  content: z.string()
})

const OrderItemSchema = z.object({
  source: z.enum(['theory', 'exercises']),
  index: z.number().int().nonnegative()
})

// ===================
// EJERCICIOS FLEXIBLES
// ===================

// Base común
const ExerciseBaseSchema = z.object({
  title: z.string(),
  answer: z.string(),
  failed_feedback: z.string(),
  exercise_type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER'])
})

// 🎯 Este es el esquema real que permite corregir dinámicamente
const ExerciseSchema = z.preprocess(
  input => {
    // eslint-disable-next-line
    const data = input as any

    // Si es MULTIPLE_CHOICE pero le faltan opciones, lo convertimos en SHORT_ANSWER
    if (
      data.exercise_type === 'MULTIPLE_CHOICE' &&
      (!Array.isArray(data.multiple_choice_options) || data.multiple_choice_options.length === 0)
    ) {
      return {
        ...data,
        exercise_type: 'SHORT_ANSWER'
      }
    }

    return data
  },
  z.discriminatedUnion('exercise_type', [
    ExerciseBaseSchema.extend({
      exercise_type: z.literal('SHORT_ANSWER')
    }),
    ExerciseBaseSchema.extend({
      exercise_type: z.literal('MULTIPLE_CHOICE'),
      multiple_choice_options: z.array(z.string())
    })
  ])
)

// ===================
// ESQUEMA PRINCIPAL
// ===================

export const FullContentSchema = z.object({
  a_theories: z.array(TheorySchema),
  b_exercises: z.array(ExerciseSchema),
  z_order: z.array(OrderItemSchema)
})

export const lessonPrompt: Prompt = {
  model: 'gemini-2.5-flash',
  config: {
    thinkingConfig: { thinkingBudget: 0 },
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ['a_theories', 'b_exercises', 'z_order'],
      properties: {
        a_theories: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['title', 'content'],
            properties: {
              title: {
                type: Type.STRING
              },
              content: {
                type: Type.STRING
              }
            }
          }
        },
        b_exercises: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['exercise_type', 'title', 'answer', 'failed_feedback'],
            properties: {
              exercise_type: {
                type: Type.STRING,
                enum: ['SHORT_ANSWER', 'MULTIPLE_CHOICE']
              },
              title: {
                type: Type.STRING
              },
              answer: {
                type: Type.STRING
              },
              failed_feedback: {
                type: Type.STRING
              },
              multiple_choice_options: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                }
              }
            }
          }
        },
        z_order: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['source', 'index'],
            properties: {
              source: {
                type: Type.STRING,
                enum: ['theory', 'exercises']
              },
              index: {
                type: Type.INTEGER
              }
            }
          }
        }
      }
    },

    systemInstruction: [
      {
        text: `
Vas a generar una lección de 6-7 páginas, que pueden ser de tipo "theory" o "exercise".

Cada página debe tener estos campos comunes:
- "type": "theory" o "exercise"
- "content": explicación teórica clara y precisa, adaptada a nivel 2º de Bachillerato

Si "type" es "theory", añade:
- "content": explicación teórica clara y precisa, adaptada a nivel 2º de Bachillerato

Si "type" es "exercise", añade:
- "exercise_type": "MULTIPLE_CHOICE" o "SHORT_ANSWER"
- "answer": la respuesta correcta como texto
- "failed_feedback": mensaje para cuando la respuesta es incorrecta

Si "exercise_type" es "MULTIPLE_CHOICE", incluye también:
- "multiple_choice_options": lista con varias opciones de respuesta, incluyendo la correcta

No añadas instrucciones genéricas como "Elija la opción correcta". Limítate a dar el enunciado del ejercicio, las opciones y el feedback para respuestas erróneas.

El contenido pertenece a una parte concreta de un itinerario mayor. Solo genera lo necesario para esta parte, sin redundancias.

Devuelve un JSON con tres arrays:

1. "a_theories": lista de objetos con:
   - "type": "theory"
   - "title": string
   - "content": string

2. "b_exercises": lista de objetos con:
   - "type": "exercise"
   - "title": string
   - "exercise_type": "MULTIPLE_CHOICE" o "SHORT_ANSWER"
   - "answer": string
   - "failed_feedback": string
   - Si "exercise_type" es "MULTIPLE_CHOICE", incluye también:
     - "multiple_choice_options": array de strings

3. "z_order": lista que indica el orden de TODAS las páginas, con objetos que tienen:
   - "source": "theory" o "exercises"
   - "index": entero, posición dentro del array correspondiente

Ejemplo de "z_order":
[
  { "source": "theory", "index": 0 },
  { "source": "exercises", "index": 0 },
  { "source": "theory", "index": 1 },
  { "source": "exercises", "index": 1 },
  { "source": "exercises", "index": 2 },
  { "source": "theory", "index": 2 },
  { "source": "exercises", "index": 3 }
]

No incluyas campos adicionales ni información extra.

Aquí tienes un resumen generado por otra IA para esta lección:
        `
      }
    ]
  }
}
