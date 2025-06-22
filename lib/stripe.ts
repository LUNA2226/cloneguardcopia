import Stripe from "stripe"

// Validate required environment variables
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID,
  STRIPE_STARTER_YEARLY_PRICE_ID: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
  STRIPE_PRO_YEARLY_PRICE_ID: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  STRIPE_ENTERPRISE_PRICE_ID: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  STRIPE_ENTERPRISE_YEARLY_PRICE_ID: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Stripe environment variables: ${missingVars.join(", ")}\n` +
      `Please add these to your .env.local file or Vercel environment variables.`,
  )
}

// Initialize Stripe with environment variable
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
})

// Check if we're in test mode
export const isTestMode = process.env.STRIPE_SECRET_KEY!.startsWith("sk_test_")

// Log warning if in production with test keys
if (process.env.NODE_ENV === "production" && isTestMode) {
  console.warn("⚠️  WARNING: Using Stripe test keys in production environment!")
}

export const STRIPE_PLANS = {
  STARTER: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    name: "STARTER",
    price: 99,
    yearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID!,
    yearlyPrice: 79,
    domains: 3,
  },
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: "PRO",
    price: 299,
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    yearlyPrice: 239,
    domains: 25,
  },
  ENTERPRISE: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    name: "ENTERPRISE",
    price: 499,
    yearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID!,
    yearlyPrice: 399,
    domains: 100,
  },
} as const

export type PlanType = keyof typeof STRIPE_PLANS

// Helper function to validate price IDs format
export function validateStripeConfig() {
  const errors: string[] = []

  // Validate secret key format
  if (!process.env.STRIPE_SECRET_KEY?.match(/^sk_(test_|live_)[a-zA-Z0-9]{99,}$/)) {
    errors.push("STRIPE_SECRET_KEY format is invalid")
  }

  // Validate webhook secret format
  if (!process.env.STRIPE_WEBHOOK_SECRET?.match(/^whsec_[a-zA-Z0-9]{32,}$/)) {
    errors.push("STRIPE_WEBHOOK_SECRET format is invalid")
  }

  // Validate price IDs format
  Object.entries(STRIPE_PLANS).forEach(([planName, plan]) => {
    if (!plan.priceId.match(/^price_[a-zA-Z0-9]{14,}$/)) {
      errors.push(`${planName} monthly price ID format is invalid`)
    }
    if (!plan.yearlyPriceId.match(/^price_[a-zA-Z0-9]{14,}$/)) {
      errors.push(`${planName} yearly price ID format is invalid`)
    }
  })

  if (errors.length > 0) {
    throw new Error(`Stripe configuration errors:\n${errors.join("\n")}`)
  }

  return true
}

// Validate configuration on module load (only in development)
if (process.env.NODE_ENV === "development") {
  try {
    validateStripeConfig()
    console.log("✅ Stripe configuration validated successfully")
    if (isTestMode) {
      console.log("🧪 Using Stripe test mode")
    }
  } catch (error) {
    console.error("❌ Stripe configuration error:", error)
  }
}
