import { ai } from './gemini-client'
import { itineraryPrompt } from './prompts/itinerary-prompt'
import { lessonPrompt } from './prompts/lesson-prompt'

export const maxDuration = 20

export async function generateItinerary(userInput: string) {
  const { model, config } = itineraryPrompt

  const contents = [
    {
      role: 'user',
      parts: [{ text: userInput }]
    }
  ]

  const response = await ai.models.generateContent({
    model,
    config,
    contents
  })

  return response.text
}

export async function generateLesson(summary: string) {
  const { model, config } = lessonPrompt

  const contents = [
    {
      role: 'user',
      parts: [{ text: summary }]
    }
  ]

  const response = await ai.models.generateContent({
    model,
    config,
    contents
  })

  return response.text
}
