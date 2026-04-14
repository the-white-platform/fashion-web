import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set — AI features will be unavailable')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Text model — Gemini 2.5 Flash (GA). Previous `gemini-2.0-flash-exp` was
// deprecated and returns 404 from the v1beta API.
export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
})

// Image-editing model — Gemini 2.5 Flash Image (aka "nano banana"). GA.
// Accepts multi-image input + prompt, returns image inlineData parts.
// The `gemini-2.5-flash-preview-04-17` alias doesn't exist; `gemini-2.5-flash-image`
// is what the ListModels endpoint actually exposes for this API key.
export const geminiFlashImage = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-image',
})

export { genAI }
