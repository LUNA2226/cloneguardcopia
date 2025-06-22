"use client"

import { useState } from "react"
import { X, Gift, Heart, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface RetentionModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: "STARTER" | "PRO" | "ENTERPRISE"
  onAcceptOffer: () => void
  onFinalCancel: (reason: string) => void
}

const planOffers = {
  STARTER: { original: 99, offer: 49 },
  PRO: { original: 299, offer: 149 },
  ENTERPRISE: { original: 499, offer: 249 },
}

const cancellationReasons = [
  "It's too expensive",
  "I'm not using it enough",
  "I found another solution",
  "I had technical problems",
  "Temporary pause",
  "Other reason",
]

export function RetentionModal({ isOpen, onClose, currentPlan, onAcceptOffer, onFinalCancel }: RetentionModalProps) {
  const [showOffer, setShowOffer] = useState(true)
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [showThankYou, setShowThankYou] = useState(false)

  const offer = planOffers[currentPlan]

  const handleDeclineOffer = () => {
    setShowOffer(false)
  }

  const handleReasonSubmit = () => {
    const finalReason = selectedReason === "Other reason" ? customReason : selectedReason
    if (finalReason.trim()) {
      onFinalCancel(finalReason)
      setShowThankYou(true)
      setTimeout(() => {
        onClose()
        setShowOffer(true)
        setSelectedReason("")
        setCustomReason("")
        setShowThankYou(false)
      }, 2000)
    }
  }

  const handleAcceptOffer = () => {
    onAcceptOffer()
    onClose()
    setShowOffer(true)
  }

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason)
    if (reason !== "Other reason") {
      setCustomReason("")
    }
  }

  const isSubmitDisabled = !selectedReason || (selectedReason === "Other reason" && !customReason.trim())

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl max-w-md w-full p-6 relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-green-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Thank you for your feedback!</h3>
              <p className="text-gray-400">Your cancellation will be processed shortly.</p>
            </motion.div>
          ) : showOffer ? (
            <motion.div
              key="offer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="text-cyan-400" size={32} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">👋 We'll miss you!</h2>

              <p className="text-gray-300 mb-6">Before you go, we want to offer you something special:</p>

              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 mb-6 border border-cyan-500/30">
                <div className="text-3xl mb-2">🎁</div>
                <h3 className="text-xl font-semibold text-white mb-2">Special Offer!</h3>
                <p className="text-gray-300 mb-4">Stay one more month for just:</p>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-2xl text-gray-400 line-through">${offer.original}</span>
                  <span className="text-4xl font-bold text-cyan-400">${offer.offer}</span>
                </div>

                <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                  <p className="text-sm text-cyan-300">💰 Save ${offer.original - offer.offer} this month!</p>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-6">
                It's a way to continue enjoying all the benefits of your subscription with a discount.
              </p>

              <div className="space-y-3">
                <motion.button
                  onClick={handleAcceptOffer}
                  animate={{
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(6, 182, 212, 0.4)",
                      "0 0 0 10px rgba(6, 182, 212, 0)",
                      "0 0 0 0 rgba(6, 182, 212, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                >
                  ✨ YES, I WANT TO STAY
                </motion.button>

                <button
                  onClick={handleDeclineOffer}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  NO, CONTINUE CANCELLATION
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-orange-400" size={32} />
              </div>

              <h3 className="text-xl font-semibold text-white mb-2 text-center">Help us improve</h3>
              <p className="text-gray-400 text-center mb-6">Why are you canceling your subscription?</p>

              <div className="space-y-3 mb-6">
                {cancellationReasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedReason === reason
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
                        : "border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancellation-reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => handleReasonChange(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedReason === reason ? "border-cyan-500 bg-cyan-500" : "border-gray-500"
                      }`}
                    >
                      {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              {/* Custom reason text field */}
              <AnimatePresence>
                {selectedReason === "Other reason" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">Please tell us more:</label>
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please describe your reason for canceling..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">{customReason.length}/500</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <button
                  onClick={handleReasonSubmit}
                  disabled={isSubmitDisabled}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Confirm Cancellation
                </button>

                <button
                  onClick={() => setShowOffer(true)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
