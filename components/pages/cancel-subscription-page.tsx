"use client"

import { useState } from "react"
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react"
import { RetentionModal } from "@/components/retention-modal"

interface CancelSubscriptionPageProps {
  setActiveScreen: (screen: string) => void
}

export function CancelSubscriptionPage({ setActiveScreen }: CancelSubscriptionPageProps) {
  const [showRetentionModal, setShowRetentionModal] = useState(false)
  const [hasSeenOffer, setHasSeenOffer] = useState(false) // Track if user has seen the offer

  const currentPlan = "PRO" // This would come from your app state/context

  const handleCancelClick = () => {
    if (!hasSeenOffer) {
      setShowRetentionModal(true)
      setHasSeenOffer(true) // Mark that user has seen the offer
    } else {
      // If user has already seen the offer, proceed with direct cancellation
      handleFinalCancel("Direct cancellation")
    }
  }

  const handleAcceptOffer = () => {
    // Handle offer acceptance logic here
    console.log("User accepted the retention offer")
    setShowRetentionModal(false)
    // You might want to redirect to payment processing or show success message
    setActiveScreen("subscription")
  }

  const handleFinalCancel = (reason: string) => {
    // Handle final cancellation logic here
    console.log("User cancelled with reason:", reason)
    setShowRetentionModal(false)
    // Process the cancellation
  }

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case "STARTER":
        return 99
      case "PRO":
        return 299
      case "ENTERPRISE":
        return 499
      default:
        return 299
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={() => setActiveScreen("subscription")} className="mr-3 p-2 rounded-full hover:bg-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Manage Subscription</h1>
      </div>

      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <Shield className="text-cyan-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">Your Current Plan: {currentPlan}</h2>
          <p className="text-gray-400">
            Your subscription is active and will renew on <span className="text-cyan-400">June 15, 2025</span>.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-750 p-4 rounded-lg">
            <h3 className="font-medium text-gray-200 mb-2">Payment Details</h3>
            <p className="text-sm text-gray-400">Payment Method: Credit Card ending in **** 1234</p>
            <p className="text-sm text-gray-400">Amount: ${getPlanPrice(currentPlan)}.00 / month</p>
            <button className="mt-3 text-sm text-cyan-400 hover:text-cyan-300">Update payment method</button>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-200">Cancellation considerations</h3>
                <p className="mt-1 text-sm text-yellow-300">
                  By canceling, you will lose access to {currentPlan} features at the end of your current billing cycle.
                  Your protected domains may become vulnerable.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              onClick={() => setActiveScreen("subscription")}
              className="px-6 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              Keep Subscription
            </button>
            <button
              onClick={handleCancelClick}
              className="px-6 py-2 text-sm bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors"
            >
              {hasSeenOffer ? "Cancel Permanently" : "Cancel Subscription"}
            </button>
          </div>
        </div>
      </div>

      <RetentionModal
        isOpen={showRetentionModal}
        onClose={() => setShowRetentionModal(false)}
        currentPlan={currentPlan as "STARTER" | "PRO" | "ENTERPRISE"}
        onAcceptOffer={handleAcceptOffer}
        onFinalCancel={handleFinalCancel}
      />
    </div>
  )
}
