import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_PLANS } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { planName, billingCycle, userId, userEmail } = await request.json()

    if (!planName || !billingCycle || !userId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const plan = STRIPE_PLANS[planName as keyof typeof STRIPE_PLANS]
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const priceId = billingCycle === "yearly" ? plan.yearlyPriceId : plan.priceId

    // Check if customer already exists using client_id
    let customerId: string
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("client_id", userId) // Changed from user_id to client_id
      .single()

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          clientId: userId, // Changed from userId to clientId
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        clientId: userId, // Changed from userId to clientId
        planName: planName,
        billingCycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          clientId: userId, // Changed from userId to clientId
          planName: planName,
          billingCycle: billingCycle,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
