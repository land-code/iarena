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

const ExerciseSchema = z.discriminatedUnion('exercise_type', [
  ExerciseBaseSchema.extend({
    exercise_type: z.literal('SHORT_ANSWER'),
    short_answer_example: z.string()
  }),
  ExerciseBaseSchema.extend({
    exercise_type: z.literal('MULTIPLE_CHOICE'),
    multiple_choice_options: z.array(z.string())
  })
])

// ===================
// ESQUEMA PRINCIPAL
// ===================

export const FullContentSchema = z.object({
  a_theories: z.array(TheorySchema),
  b_exercises: z.preprocess(input => {
    if (!Array.isArray(input)) return input
    return input.filter(data => {
      if (
        data.exercise_type === 'MULTIPLE_CHOICE' &&
        (!Array.isArray(data.multiple_choice_options) || data.multiple_choice_options.length === 0)
      ) {
        return false
      }

      if (
        data.exercise_type === 'MULTIPLE_CHOICE' &&
        data.multiple_choice_options.includes(data.answer)
      ) {
        return false
      }

      return true // se mantiene
    })
  }, z.array(ExerciseSchema)),
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
    "type": "theory" o "exercise".

Si "type" es "theory", añade:
    - "content": explicación teórica clara y precisa, nivel 2º de Bachillerato, usando Markdown.

    Puedes incluir diagramas con bloques de código Mermaid, pero SOLO si el código es válido y soportado por Mermaid.

        Ejemplo válido (flujo simple):

\`\`\`mermaid
flowchart LR
  A[Inicio] --> B[Procesar datos]
  B --> C[Mostrar resultado]
\`\`\`

Ejemplo válido (diagrama mental):

\`\`\`mermaid
mindmap
  root((mapa mental))
    Orígenes
      Historia larga
      ::icon(fa fa-book)
      Popularidad
        Autor psicológico popular británico **Tony Buzan
    Investigación
      En efectividad<br/>y características
      En creación automática
        Usos
            **Técnicas** creativas
            **Planificación** estratégica
            **Mapeado** de argumentos
    Herramientas
      Bolígrafo y papel
      Mermaid
\`\`\`

    No uses diagramas Mermaid que no existan (por ejemplo, diagramas de Venn).

    Si el contenido requiere un diagrama no soportado, describe el proceso en texto claro y conciso en lugar de Mermaid inválido.

    Escapa correctamente caracteres especiales dentro del código Mermaid.

    Cierra siempre el bloque de código con tres acentos graves.

    "image_search": una cadena breve (máx. 8-9 palabras) para búsqueda en Google, describiendo de forma precisa el contenido visual deseado (preferir diagramas o esquemas).

Si "type" es "exercise", añade:
    "exercise_type": "MULTIPLE_CHOICE" o "SHORT_ANSWER". SHORT_ANSWER solo se puede usar cuando hay una única respuesta correcta, y esta debe ser breve.
    "answer": respuesta correcta textual (breve).
    "failed_feedback": retroalimentación breve y clara para respuestas erróneas.

Si "exercise_type" es "SHORT_ANSWER", añade también:
    "short_answer_example": ejemplo que guíe sobre el formato o tipo de respuesta esperada (sin dar la respuesta correcta).
        Ejemplo: "Introduce el resultado en número sin símbolos de unidades, siendo estas m/s²", "Introduce tu respuesta"

Si "exercise_type" es "MULTIPLE_CHOICE", añade también:
    "multiple_choice_options": lista con varias opciones (incluyendo la correcta).
        Ejemplo: ["3x10⁸ m/s", "1.5x10⁸ m/s", "9.8 m/s²", "6.67x10⁻¹¹ N·m²/kg²"]

Estructura de salida en JSON:

    "a_theories": array de objetos con:
        "type": "theory"
        "title": string
        "content": string
        "image_search": string

    "b_exercises": array de objetos con:
        "type": "exercise"
        "title": string
        "exercise_type": "MULTIPLE_CHOICE" o "SHORT_ANSWER"
        "answer": string
        "failed_feedback": string
        Si "SHORT_ANSWER": "short_answer_example"
        Si "MULTIPLE_CHOICE": "multiple_choice_options"

    "z_order": array con el orden de todas las páginas:
        "source": "theory" o "exercises"
        "index": entero

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

Ejemplo final:
  {
  "a_theories": [
    {
      "type": "theory",
      "title": "Introducción a las derivadas",
      "content": "## Concepto de derivada\n\nLa **derivada** de una función en un punto representa la **tasa de cambio instantánea** de la función en ese punto. Matemáticamente, se define como el límite:\n\n$$ f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} $$\n\n### Interpretación geométrica\n\n- La derivada es la **pendiente de la recta tangente** a la curva en un punto.\n- Si $f'(x) > 0$, la función es creciente en $x$.\n- Si $f'(x) < 0$, la función es decreciente en $x$.\n\n\`\`\`mermaid\nflowchart LR\n  A[Función f(x)] --> B[Derivada f'(x)]\n  B --> C[Pendiente tangente]\n  B --> D[Tasa de cambio]\n\`\`\`",
      "image_search": "recta tangente gráfica derivada pendiente"
    },
    {
      "type": "theory",
      "title": "Reglas básicas de derivación",
      "content": "## Reglas fundamentales\n\n1. **Derivada de una constante**:\n   $$ \\frac{d}{dx}(c) = 0 $$\n\n2. **Derivada de x**:\n   $$ \\frac{d}{dx}(x) = 1 $$\n\n3. **Regla de la potencia**:\n   $$ \\frac{d}{dx}(x^n) = n \\cdot x^{n-1} $$\n\n4. **Regla del producto**:\n   $$ (f \\cdot g)' = f' \\cdot g + f \\cdot g' $$\n\n5. **Regla del cociente**:\n   $$ \\left(\\frac{f}{g}\\right)' = \\frac{f' \\cdot g - f \\cdot g'}{g^2} $$\n\n6. **Regla de la cadena**:\n   $$ (f(g(x)))' = f'(g(x)) \\cdot g'(x) $$",
      "image_search": "reglas derivación matemáticas gráfico"
    },
    {
      "type": "theory",
      "title": "Derivadas de funciones trascendentes",
      "content": "## Funciones exponenciales y logarítmicas\n\n- **Exponencial natural**:\n  $$ \\frac{d}{dx}(e^x) = e^x $$\n\n- **Logaritmo natural**:\n  $$ \\frac{d}{dx}(\\ln x) = \\frac{1}{x} $$\n\n## Funciones trigonométricas\n\n- **Seno**:\n  $$ \\frac{d}{dx}(\\sin x) = \\cos x $$\n\n- **Coseno**:\n  $$ \\frac{d}{dx}(\\cos x) = -\\sin x $$\n\n- **Tangente**:\n  $$ \\frac{d}{dx}(\\tan x) = \\sec^2 x $$\n\n\`\`\`mermaid\nclassDiagram\n  Funciones <|-- Exponenciales\n  Funciones <|-- Logarítmicas\n  Funciones <|-- Trigonométricas\n  Exponenciales : +e^x\n  Logarítmicas : +ln x\n  Trigonométricas : +sen x, cos x, tan x\n\`\`\`",
      "image_search": "derivadas funciones trigonométricas exponenciales"
    }
  ],
  "b_exercises": [
    {
      "type": "exercise",
      "title": "Cálculo de derivada básica",
      "exercise_type": "MULTIPLE_CHOICE",
      "answer": "3x^2 + 6x",
      "failed_feedback": "Recuerda aplicar la regla de la potencia para cada término",
      "multiple_choice_options": ["3x^2 + 6x", "2x^2 + 6x", "3x^2 + 3x"]
    },
    {
      "type": "exercise",
      "title": "Selección de regla de derivación",
      "exercise_type": "MULTIPLE_CHOICE",
      "answer": "Regla del producto",
      "failed_feedback": "Analiza si la función es un producto, cociente o composición",
      "multiple_choice_options": [
        "Regla de la potencia",
        "Regla del producto",
        "Regla del cociente",
        "Regla de la cadena"
      ]
    },
    {
      "type": "exercise",
      "title": "Deriva la función: f(x) = ln(x + 1)",
      "exercise_type": "SHORT_ANSWER",
      "answer": "1/(x+1)",
      "failed_feedback": "Recuerda: d/dx[ln(u)] = u'/u. Aquí u = x + 1",
      "short_answer_example": "2/(2x+3)"
    }
  ],
  "z_order": [
    { "source": "theory", "index": 0 },
    { "source": "exercises", "index": 0 },
    { "source": "theory", "index": 1 },
    { "source": "exercises", "index": 1 },
    { "source": "theory", "index": 2 },
    { "source": "exercises", "index": 2 }
  ]
}

A continuación tienes la entrada real de esta lección. Limítate a lo que se te pide, ya que el resto probablemente ya fue tratado en otra lección:
        `
      }
    ]
  }
}
