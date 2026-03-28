import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set — AI features will be unavailable')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
})

export { genAI }
