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
      // `sendOrderNotification` skips the Zalo step silently when
      // these (or the matching ZALO_ZNS_* template ids) are missing
      // and falls through to email / SMS.
      ZALO_APP_ID?: string
      ZALO_APP_SECRET?: string
      ZALO_REFRESH_TOKEN?: string
      ZALO_ZNS_ORDER_STATUS?: string
      ZALO_ZNS_OTP?: string
      // Birthday / promo discount code template (572054 at time of
      // writing). Parameters expected by the template live next to
      // `sendCustomerDiscount` in src/utilities/sendCustomerDiscount.ts.
      ZALO_ZNS_CUSTOMER_DISCOUNT?: string
      // Welcome ZNS fired the first time a user's phone number is
      // known (template 572063 at time of writing). Parameter
      // shape lives in src/utilities/sendCustomerWelcome.ts.
      ZALO_ZNS_WELCOME?: string
      // SMS provider selector for the last-resort channel in
      // `sendOrderNotification`. No provider is wired yet, so
      // setting this today only enables a "would have sent" log
      // line — the actual dispatcher comes later.
      // IndexNow verification key (8–128 alphanumeric chars).
      // Ownership proof is served at /indexnow-<KEY>.txt via the
      // dynamic route in src/app/(frontend)/indexnow-[key]/route.ts.
      // Leave unset to disable IndexNow pings entirely.
      INDEXNOW_KEY?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
