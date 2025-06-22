import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { userId, immediate = false } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get subscription using client_id
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("client_id", userId) // Changed from user_id to client_id
      .single()

    if (error || !subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    if (subscription.status === "canceled") {
      return NextResponse.json({ error: "Subscription is already canceled" }, { status: 400 })
    }

    // Cancel subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: !immediate,
      ...(immediate && { proration_behavior: "none" }),
    })

    // Update in database
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: immediate ? "canceled" : canceledSubscription.status,
        canceled_at: immediate ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.stripe_subscription_id)

    if (updateError) {
      console.error("Error updating subscription in database:", updateError)
    }

    return NextResponse.json({
      success: true,
      message: immediate
        ? "Subscription canceled immediately"
        : "Subscription will be canceled at the end of the current period",
      canceledAt: immediate ? new Date().toISOString() : canceledSubscription.current_period_end * 1000,
    })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
