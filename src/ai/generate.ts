import { ai } from './gemini-client'
import { itineraryPrompt } from './prompts/itinerary-prompt'

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
