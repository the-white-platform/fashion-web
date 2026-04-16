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
      // Zalo Official Account credentials for ZNS notifications.
      // sendZaloOrderNotifications skips silently when these (and the
      // ZNS_ORDER_CONFIRMATION / ZNS_SHIPPING template ids) are missing.
      ZALO_APP_ID?: string
      ZALO_APP_SECRET?: string
      ZALO_REFRESH_TOKEN?: string
      ZALO_ZNS_ORDER_CONFIRMATION?: string
      ZALO_ZNS_ORDER_STATUS?: string
      ZALO_ZNS_SHIPPING?: string
      ZALO_ZNS_DELIVERY?: string
      ZALO_ZNS_CANCELLED?: string
      ZALO_ZNS_REFUND?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
