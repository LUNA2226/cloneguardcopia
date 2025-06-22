"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { ClonesPage } from "@/components/pages/clones-page"
import { ActionScreen } from "@/components/action-screen"
import { ProtectedDomains } from "@/components/protected-domains"
import { Settings } from "@/components/settings"
import { AddDomainPage } from "@/components/pages/add-domain-page"
import { LoginPage } from "@/components/pages/auth/login-page"
import { RegisterPage } from "@/components/pages/auth/register-page"
import { ForgotPasswordPage } from "@/components/pages/auth/forgot-password-page"
import { PricingPage } from "@/components/pages/pricing-page"
import { RealTimePage } from "@/components/pages/real-time-page"
import { TutorialsPage } from "@/components/pages/tutorials-page"
import { CancelSubscriptionPage } from "@/components/pages/cancel-subscription-page"
import { AnalyticsPage } from "@/components/pages/analytics-page"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authScreen, setAuthScreen] = useState("login")
  const [activeScreen, setActiveScreen] = useState("dashboard")
  const [selectedDomain, setSelectedDomain] = useState<any>(null)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleViewActions = (domain: any) => {
    setSelectedDomain(domain)
    setActiveScreen("actions")
  }

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    switch (authScreen) {
      case "register":
        return <RegisterPage onLogin={() => setAuthScreen("login")} />
      case "forgot-password":
        return <ForgotPasswordPage onBack={() => setAuthScreen("login")} />
      default:
        return (
          <LoginPage
            onRegister={() => setAuthScreen("register")}
            onForgotPassword={() => setAuthScreen("forgot-password")}
            onLogin={handleLogin}
          />
        )
    }
  }

  // If authenticated, show main app
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      <main className="flex-1 overflow-auto">{renderScreen()}</main>
    </div>
  )

  function renderScreen() {
    switch (activeScreen) {
      case "dashboard":
        return <Dashboard onViewActions={handleViewActions} onAddDomain={() => setActiveScreen("add-domain")} />
      case "clones":
        return <ClonesPage />
      case "actions":
        return <ActionScreen domain={selectedDomain} onBack={() => setActiveScreen("clones")} />
      case "domains":
        return <ProtectedDomains />
      case "settings":
        return <Settings />
      case "subscription":
        return <PricingPage setActiveScreen={setActiveScreen} />
      case "add-domain":
        return <AddDomainPage onBack={() => setActiveScreen("dashboard")} />
      case "realtime":
        return <RealTimePage />
      case "cancel-subscription":
        return <CancelSubscriptionPage setActiveScreen={setActiveScreen} />
      case "tutorials":
        return <TutorialsPage />
      case "analytics":
        return <AnalyticsPage />
      default:
        return <Dashboard onViewActions={handleViewActions} onAddDomain={() => setActiveScreen("add-domain")} />
    }
  }
}
