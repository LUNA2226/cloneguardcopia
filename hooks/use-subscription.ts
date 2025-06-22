"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Subscription {
  id: string
  plan_name: string
  status: string
  billing_cycle: string
  current_period_start: string
  current_period_end: string
  canceled_at: string | null
  client_id: string
}

export function useSubscription(userId: string | null) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchSubscription()
  }, [userId])

  const fetchSubscription = async () => {
    try {
      setLoading(true)

      // Use client_id instead of user_id to match our database schema
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("client_id", userId) // Changed from user_id to client_id
        .eq("status", "active")
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error
      }

      setSubscription(data)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching subscription:", err)
      setError(err.message || "Failed to load subscription")
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (planName: string, billingCycle: string, userEmail: string) => {
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          billingCycle,
          userId,
          userEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }

      return data
    } catch (err: any) {
      console.error("Error creating checkout session:", err)
      throw err
    }
  }

  const createPortalSession = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal session")
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      }

      return data
    } catch (err: any) {
      console.error("Error creating portal session:", err)
      throw err
    }
  }

  const cancelSubscription = async (immediate = false) => {
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, immediate }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription")
      }

      // Refresh subscription data
      await fetchSubscription()

      return data
    } catch (err: any) {
      console.error("Error canceling subscription:", err)
      throw err
    }
  }

  return {
    subscription,
    loading,
    error,
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    refetch: fetchSubscription,
  }
}
