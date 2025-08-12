import { Type } from '@google/genai'
import { Prompt } from './types'
import z from 'zod'

// ===================
// TEORÍA Y ORDEN
// ===================

const TheorySchema = z.object({
  title: z.string(),
  content: z.string(),
  image_search: z.string().optional()
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

    // If its MULTIPLE_CHOICE type, but lacks options, we convert in SHORT_ANSWER
    if (
      data.exercise_type === 'MULTIPLE_CHOICE' &&
      (!Array.isArray(data.multiple_choice_options) || data.multiple_choice_options.length === 0)
    ) {
      return {
        ...data,
        exercise_type: 'SHORT_ANSWER',
        short_answer_example:
          typeof data.short_answer_example === 'string' ? data.short_answer_example : undefined
      }
    }

    return data
  },
  z.discriminatedUnion('exercise_type', [
    ExerciseBaseSchema.extend({
      exercise_type: z.literal('SHORT_ANSWER'),
      short_answer_example: z.string()
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
              },
              image_search: {
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
              short_answer_example: {
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
Vas a generar una lección de 6-7 páginas que pueden ser de tipo "theory" o "exercise".

Cada página debe tener estos campos comunes:
- "type": "theory" o "exercise".

Si "type" es "theory", añade:
- "content": explicación teórica clara y precisa, nivel 2º de Bachillerato, usando Markdown.
- Puedes incluir diagramas con bloques de código Mermaid, pero SOLO si el código es válido y soportado por Mermaid.  
- Evita diagramas Mermaid que no existan (como diagramas de Venn). Si la temática requiere un diagrama complejo no soportado, usa descripciones en texto claras y concisas en lugar de diagramas inválidos.
- Escapa correctamente los caracteres especiales en el código Mermaid.
- Cierra siempre el bloque de código con tres acentos graves y la palabra "mermaid", y asegúrate que el bloque es sintácticamente correcto.

- "image_search": una cadena breve para búsqueda de imagen en Google, con un máximo de 8-9 palabras. Debe describir de forma precisa el contenido visual deseado en español. Preferir imágenes de diagramas o esquemas claros.

Si "type" es "exercise", añade:
- "exercise_type": "MULTIPLE_CHOICE" o "SHORT_ANSWER" (breve).
- "answer": respuesta correcta textual.
- "failed_feedback": retroalimentación breve y clara para respuestas erróneas.

Si "exercise_type" es "SHORT_ANSWER", añade también:
- "short_answer_example": ejemplo que guíe sobre formato o tipo de respuesta esperada (sin dar la respuesta correcta).

Si "exercise_type" es "MULTIPLE_CHOICE", añade también:
- "multiple_choice_options": lista con varias opciones, incluyendo la correcta.

No incluyas instrucciones genéricas ni textos adicionales. Solo el contenido concreto de teoría o ejercicio.

El contenido debe ser concreto, sin redundancias ni información extra.

Devuelve un JSON con tres arrays:

1. "a_theories": array de objetos con:
   - "type": "theory"
   - "title": string
   - "content": string
   - "image_search": string (opcional)

2. "b_exercises": array de objetos con:
   - "type": "exercise"
   - "title": string
   - "exercise_type": "MULTIPLE_CHOICE" o "SHORT_ANSWER"
   - "answer": string
   - "failed_feedback": string
   - Si "exercise_type" es "SHORT_ANSWER", añade "short_answer_example"
   - Si "exercise_type" es "MULTIPLE_CHOICE", añade "multiple_choice_options"

3. "z_order": array con el orden de TODAS las páginas, objetos con:
   - "source": "theory" o "exercises"
   - "index": entero, posición en el array correspondiente

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

No añadas campos ni información extra.

Aquí tienes un resumen generado por otra IA para esta lección:
        `
      }
    ]
  }
}
