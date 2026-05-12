import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI: GoogleGenerativeAI | null = null

function getClient(apiKey: string): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

function extractRetryDelay(error: any): number | null {
  const match = error.message?.match(/Please retry in (\d+(?:\.\d+)?)\s*s\.?/)
  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000) + 1000
  }
  return null
}

function isQuotaError(error: any): boolean {
  return (
    error.status === 'RESOURCE_EXHAUSTED' ||
    error.message?.includes('quota') ||
    error.message?.includes('RESOURCE_EXHAUSTED') ||
    error?.code === 429
  )
}

export async function generateWithGemini(
  prompt: string,
  apiKey: string,
  modelName: string = 'gemini-2.0-flash',
  retries: number = 2
): Promise<string> {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add it in Settings.')
  }

  const client = getClient(apiKey)

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const model = client.getGenerativeModel({ model: attempt === 0 ? modelName : 'gemini-2.0-flash-lite' })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      if (!text) {
        throw new Error('Gemini returned an empty response. Please try again.')
      }

      return text.trim()
    } catch (error: any) {
      const isLastAttempt = attempt === retries

      if (isQuotaError(error)) {
        const delay = extractRetryDelay(error)
        if (delay && !isLastAttempt) {
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
        throw new Error(
          `Gemini API quota exceeded. ${delay ? `Please wait ${Math.round(delay / 1000)}s and try again.` : 'Try again later or add a billing account at https://ai.google.dev/pricing'}`
        )
      }

      if (!isLastAttempt) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)))
        continue
      }

      throw new Error(error.message || 'Gemini API request failed. Please try again.')
    }
  }

  throw new Error('Failed to generate content after retries.')
}
