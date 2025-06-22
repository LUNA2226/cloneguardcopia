"use client"

import type React from "react"

import { useState } from "react"
import { Globe, Plus, AlertCircle } from "lucide-react"
import { ProtectionModal } from "./protection-modal"

interface AddDomainModalProps {
  isOpen: boolean
  onClose: () => void
  onAddDomain: (domain: string) => void
  remainingDomains: number
  maxDomains: number
}

function AddDomainModal({ isOpen, onClose, onAddDomain, remainingDomains, maxDomains }: AddDomainModalProps) {
  const [domain, setDomain] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!domain.trim()) {
      setError("Domain is required")
      return
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
      setError("Please enter a valid domain name")
      return
    }

    if (remainingDomains <= 0) {
      setError("You've reached your domain limit. Please upgrade your plan.")
      return
    }

    try {
      setIsSubmitting(true)
      // Here you would typically make an API call to add the domain
      // For now, we'll just simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onAddDomain(domain)
      setDomain("")
      onClose()
    } catch (err) {
      setError("Failed to add domain. Please try again.")
      console.error("Error adding domain:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Domain</h2>

        <div className="mb-6 p-4 bg-gray-750 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Domain Limit</span>
            <span className="font-medium">
              {maxDomains - remainingDomains} / {maxDomains}
              <span className="ml-2 text-xs text-gray-500">domains used</span>
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                remainingDomains === 0 ? "bg-red-500" : "bg-cyan-500"
              }`}
              style={{ width: `${((maxDomains - remainingDomains) / maxDomains) * 100}%` }}
            />
          </div>
          {remainingDomains <= 0 && (
            <p className="mt-2 text-xs text-red-400">
              You've reached your domain limit. Please upgrade your plan to add more domains.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-2">
              Domain Name
            </label>
            <input
              type="text"
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={isSubmitting || remainingDomains <= 0}
            />
            <p className="mt-1 text-xs text-gray-400">Enter the domain you want to protect without http:// or www.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-cyan-600 text-white rounded-lg ${
                isSubmitting || remainingDomains <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-cyan-500"
              }`}
              disabled={isSubmitting || remainingDomains <= 0}
            >
              {isSubmitting ? "Adding..." : "Add Domain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ProtectedDomains() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isProtectionModalOpen, setIsProtectionModalOpen] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<any>(null)

  // Mock subscription data - in a real app, this would come from your subscription hook
  const [subscriptionPlan, setSubscriptionPlan] = useState({
    name: "PRO",
    maxDomains: 5,
  })

  const [domains, setDomains] = useState([
    {
      id: 1,
      domain: "minhapagina.com.br",
      status: "protected",
      lastCheck: "2 min atrás",
      threats: 0,
    },
    {
      id: 2,
      domain: "ofertaespecial.com",
      status: "alert",
      lastCheck: "5 min atrás",
      threats: 3,
    },
    {
      id: 3,
      domain: "cursoonline.net",
      status: "protected",
      lastCheck: "1 hora atrás",
      threats: 0,
    },
  ])

  const handleAddDomain = (newDomain: string) => {
    // In a real app, you would make an API call to add the domain
    console.log("Adding domain:", newDomain)
    // For demo purposes, let's just add it to the domains array
    const newDomainObj = {
      id: domains.length + 1,
      domain: newDomain,
      status: "protected",
      lastCheck: "just now",
      threats: 0,
    }
    // Update domains array
    // In a real app, this would happen after a successful API call
    setDomains([...domains, newDomainObj])
  }

  // Calculate remaining domains
  const remainingDomains = subscriptionPlan.maxDomains - domains.length

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Protected Domains</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Domain
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="text-cyan-400 mr-2" size={20} />
              <span className="text-sm text-gray-400">
                {domains.length}/{subscriptionPlan.maxDomains} protected domains
              </span>
            </div>
            <span className="text-xs text-gray-500">{subscriptionPlan.name} Plan</span>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Domain</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Last Check</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Threats</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {domains.map((domain) => (
              <tr key={domain.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="font-medium">{domain.domain}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      domain.status === "protected" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {domain.status === "protected" ? "Protected" : "Alert"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{domain.lastCheck}</td>
                <td className="px-4 py-3 text-sm">
                  {domain.threats > 0 ? (
                    <div className="flex items-center text-red-400">
                      <AlertCircle size={16} className="mr-1" />
                      {domain.threats} detected
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => {
                      setSelectedDomain(domain)
                      setIsProtectionModalOpen(true)
                    }}
                    className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500"
                  >
                    Protection
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isProtectionModalOpen && selectedDomain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ProtectionModal
            domain={{ domain: selectedDomain.domain }}
            onClose={() => {
              setIsProtectionModalOpen(false)
              setSelectedDomain(null)
            }}
            data={{
              settings: {
                autoRedirect: false,
                visualSabotage: false,
                replaceImages: false,
                fixCheckoutLinks: false,
                redirectLinks: false,
              },
              imageUrl: "",
              checkoutSettings: {
                checkoutUrl: "",
              },
              randomPageUrl: "",
            }}
          />
        </div>
      )}
      {isAddModalOpen && (
        <AddDomainModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddDomain={handleAddDomain}
          remainingDomains={remainingDomains}
          maxDomains={subscriptionPlan.maxDomains}
        />
      )}
    </div>
  )
}
