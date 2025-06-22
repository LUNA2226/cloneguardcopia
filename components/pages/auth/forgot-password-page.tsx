"use client"

import type React from "react"
import { useState } from "react"
import { Shield, ArrowLeft } from "lucide-react"

interface ForgotPasswordPageProps {
  onBack: () => void
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSent(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-6 rounded-lg">
        <div className="flex flex-col items-center">
          <div className="bg-cyan-400/10 p-3 rounded-full">
            <Shield className="h-8 w-8 text-cyan-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Reset password</h2>
          <p className="mt-2 text-sm text-gray-400 text-center">
            {!isSent
              ? "Enter your email to receive reset instructions"
              : "Email sent! Check your inbox to reset your password"}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Send instructions"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Try again
            </button>
          </div>
        )}

        <div className="text-center">
          <button onClick={onBack} className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300">
            <ArrowLeft size={16} className="mr-2" />
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
