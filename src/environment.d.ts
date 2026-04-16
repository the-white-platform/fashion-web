declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URI: string
      NEXT_PUBLIC_SERVER_URL: string
      GCP_PROJECT_ID: string
      GCP_REGION: string
      VTO_BUCKET_NAME: string
      // Vertex AI region for the VTO image model (default us-central1).
      VERTEX_LOCATION?: string
      // Comma-separated provider order for /api/vto/generate. Defaults
      // to "vertex,gemini". Set to "gemini" to disable Vertex entirely
      // (e.g. for local dev without ADC).
      VTO_PROVIDER_ORDER?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
