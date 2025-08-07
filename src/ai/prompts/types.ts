import { GenerateContentConfig } from '@google/genai'

export type Prompt = {
  model: string
  config: GenerateContentConfig
}
