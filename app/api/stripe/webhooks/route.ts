import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Get webhook secret from environment variable
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.error("Missing stripe-signature header")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Log webhook event (but not sensitive data)
    console.log(`Processing webhook event: ${event.type} (${event.id})`)

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, planName, billingCycle } = session.metadata || {}

  if (!userId || !planName || !billingCycle) {
    console.error("Missing metadata in checkout session:", session.id)
    return
  }

  try {
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    await upsertSubscription(subscription, userId, planName, billingCycle)

    console.log(`Checkout completed for user ${userId}, plan ${planName}`)
  } catch (error) {
    console.error("Error handling checkout completion:", error)
    throw error
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { userId, planName, billingCycle } = subscription.metadata

  if (!userId || !planName || !billingCycle) {
    console.error("Missing metadata in subscription:", subscription.id)
    return
  }

  try {
    await upsertSubscription(subscription, userId, planName, billingCycle)
    console.log(`Subscription updated: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling subscription update:", error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)

    if (error) {
      console.error("Error updating canceled subscription:", error)
      throw error
    }

    console.log(`Subscription canceled: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling subscription deletion:", error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
      const { userId, planName, billingCycle } = subscription.metadata

      if (userId && planName && billingCycle) {
        await upsertSubscription(subscription, userId, planName, billingCycle)
        console.log(`Payment succeeded for subscription: ${subscription.id}`)
      }
    } catch (error) {
      console.error("Error handling payment success:", error)
      throw error
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", invoice.subscription as string)

      if (error) {
        console.error("Error updating past due subscription:", error)
        throw error
      }

      console.log(`Payment failed for subscription: ${invoice.subscription}`)
    } catch (error) {
      console.error("Error handling payment failure:", error)
      throw error
    }
  }
}

async function upsertSubscription(
  subscription: Stripe.Subscription,
  userId: string,
  planName: string,
  billingCycle: string,
) {
  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0].price.id,
    plan_name: planName,
    status: subscription.status,
    billing_cycle: billingCycle,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    metadata: subscription.metadata,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("subscriptions").upsert(subscriptionData, {
    onConflict: "stripe_subscription_id",
  })

  if (error) {
    console.error("Error upserting subscription:", error)
    throw error
  }

  console.log("Successfully upserted subscription:", subscription.id)
}
