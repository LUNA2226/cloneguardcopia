"use client"

import { buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useSubscription } from "@/hooks/use-subscription"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Star, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import confetti from "canvas-confetti"

interface PricingPlan {
  name: string
  price: string
  yearlyPrice: string
  period: string
  features: string[]
  description: string
  buttonText: string
  href: string
  isPopular: boolean
  isCurrent?: boolean
}

interface PricingProps {
  plans: PricingPlan[]
  title?: string
  description?: string
  setActiveScreen?: (screen: string) => void
  userId?: string
  userEmail?: string
}

export function Pricing({
  plans,
  title = "Escolha seu Plano",
  description = "Todos os planos incluem acesso à nossa plataforma, ferramentas de proteção e suporte dedicado.",
  setActiveScreen,
  userId = "user_123", // Mock user ID - replace with real auth
  userEmail = "user@example.com", // Mock email - replace with real auth
}: PricingProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const switchRef = useRef<HTMLButtonElement>(null)

  const { subscription, createCheckoutSession, createPortalSession } = useSubscription(userId)

  const handleToggle = (checked: boolean) => {
    setIsYearly(checked)
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2

      confetti({
        particleCount: 80,
        spread: 70,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle", "square"],
      })
    }
  }

  const handlePlanSelect = async (plan: PricingPlan) => {
    if (plan.isCurrent) return

    // If user has subscription, redirect to portal for plan changes
    if (subscription && subscription.status === "active") {
      try {
        setLoadingPlan(plan.name)
        await createPortalSession()
      } catch (error) {
        console.error("Error opening customer portal:", error)
        alert("Erro ao abrir portal de pagamento. Tente novamente.")
      } finally {
        setLoadingPlan(null)
      }
      return
    }

    // Create new subscription
    try {
      setLoadingPlan(plan.name)
      await createCheckoutSession(plan.name, isYearly ? "yearly" : "monthly", userEmail)
    } catch (error) {
      console.error("Error creating checkout session:", error)
      alert("Erro ao processar pagamento. Tente novamente.")
    } finally {
      setLoadingPlan(null)
    }
  }

  const getButtonText = (plan: PricingPlan) => {
    if (plan.isCurrent) return "Plano Atual"
    if (subscription && subscription.status === "active") return "Alterar Plano"
    return "Assinar Agora"
  }

  return (
    <div className="container py-10 md:py-16">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{title}</h2>
        <p className="text-gray-400 text-lg whitespace-pre-line">{description}</p>
      </div>

      <div className="flex justify-center items-center mb-10 space-x-3">
        <span className={`font-semibold ${!isYearly ? "text-cyan-400" : "text-gray-400"}`}>Mensal</span>
        <Label htmlFor="billing-cycle-switch" className="sr-only">
          Alternar ciclo de faturamento
        </Label>
        <Switch
          ref={switchRef}
          checked={isYearly}
          onCheckedChange={handleToggle}
          id="billing-cycle-switch"
          aria-label="Alternar para cobrança anual ou mensal"
        />
        <span className={`font-semibold ${isYearly ? "text-cyan-400" : "text-gray-400"}`}>
          Anual <span className="text-cyan-500 text-sm">(Economize 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ y: 50, opacity: 0 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: plans.length > 1 && (index === 2 ? -15 : index === 0 ? 15 : 0),
                    scale: plans.length > 1 && (index === 0 || index === 2) ? 0.95 : 1.0,
                  }
                : {}
            }
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 80,
              damping: 20,
              delay: index * 0.1,
            }}
            className={cn(
              `rounded-2xl p-6 text-center relative`,
              plan.isPopular ? "border-2 border-cyan-500 bg-gray-800" : "border border-gray-700 bg-gray-800",
              "flex flex-col",
              isDesktop && !plan.isPopular && plans.length > 1 ? "md:mt-5" : "",
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-cyan-600 py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                <Star className="text-white h-4 w-4 fill-current" />
                <span className="text-white ml-1 font-sans text-xs font-semibold">Popular</span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-base font-semibold text-gray-400">{plan.name}</p>
              <div className="mt-6 flex flex-col items-center">
                <div className="flex items-baseline justify-center gap-x-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly ? `${plan.name}-yearly` : `${plan.name}-monthly`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="text-5xl font-bold tracking-tight text-white"
                    >
                      R${isYearly ? plan.yearlyPrice : plan.price}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-400">
                    / {plan.period === "per month" ? "mês" : plan.period}
                  </span>
                </div>

                {isYearly && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs text-cyan-400 mt-1"
                  >
                    equivalente a R${Number(plan.yearlyPrice) * 12}/ano
                  </motion.p>
                )}
                <p className="text-xs mt-1 text-gray-500">{isYearly ? "cobrado anualmente" : "cobrado mensalmente"}</p>
              </div>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-x-3">
                    <Check className="h-5 w-5 flex-none text-cyan-400" aria-hidden="true" />
                    <span className="text-left">{feature}</span>
                  </li>
                ))}
              </ul>
              <hr className="w-full my-6 border-gray-700" />
              <button
                onClick={() => handlePlanSelect(plan)}
                disabled={plan.isCurrent || loadingPlan === plan.name}
                className={cn(
                  buttonVariants({
                    size: "lg",
                  }),
                  "w-full group relative gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out",
                  plan.isCurrent
                    ? "bg-green-600 text-white cursor-default hover:bg-green-600"
                    : plan.isPopular
                      ? "bg-cyan-600 text-white hover:bg-cyan-500 hover:ring-2 hover:ring-cyan-400 hover:ring-offset-1"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:ring-2 hover:ring-gray-500 hover:ring-offset-1",
                  loadingPlan === plan.name && "opacity-75 cursor-not-allowed",
                )}
              >
                {loadingPlan === plan.name ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  getButtonText(plan)
                )}
              </button>
              <p className="mt-6 text-xs leading-5 text-gray-500">{plan.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
