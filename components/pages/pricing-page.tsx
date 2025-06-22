"use client"

import { Pricing } from "@/components/ui/pricing" // Updated import path

interface PricingPageProps {
  setActiveScreen: (screen: string) => void
}

// Prices from the existing CloneGuard dashboard
const cloneGuardPlans = [
  {
    name: "STARTER",
    price: "99",
    yearlyPrice: "79",
    period: "per month",
    features: ["3 domínios protegidos", "Proteção básica", "Detecção em tempo real", "Notificação", "Suporte 24/7"],
    description: "Ideal para pequenos negócios e profissionais",
    buttonText: "Mudar Plano",
    href: "change-plan-starter", // Placeholder for navigation logic
    isPopular: false,
  },
  {
    name: "PRO",
    price: "299",
    yearlyPrice: "239",
    period: "per month",
    features: [
      "25 domínios protegidos",
      "Tudo do Starter",
      "Proteção avançada (camadas extras de verificação)",
      "Notificação",
      "Suporte prioritário",
      "Integração com Google Analytics",
    ],
    description: "Perfeito para empresas em crescimento",
    buttonText: "Plano Atual",
    href: "#",
    isPopular: true,
    isCurrent: true,
  },
  {
    name: "ENTERPRISE",
    price: "499",
    yearlyPrice: "399",
    period: "per month",
    features: [
      "100 domínios protegidos",
      "Tudo do Pro",
      "Proteção multi-camada",
      "Alertas em tempo real",
      "Suporte prioritário",
    ],
    description: "Para grandes empresas com necessidades específicas",
    buttonText: "Mudar Plano",
    href: "change-plan-enterprise", // Placeholder for navigation logic
    isPopular: false,
  },
]

export function PricingPage({ setActiveScreen }: PricingPageProps) {
  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      {/* Current Plan Summary - Kept from original for context */}
      <div className="mb-12 bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Gerencie seu plano atual e explore outras opções disponíveis
            </h3>
            <div className="flex flex-col md:flex-row gap-4 md:items-center text-gray-400">
              <div className="flex items-center gap-2">
                <span>Seu plano atual:</span>
                <span className="text-cyan-400 font-semibold">PRO</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Próxima cobrança:</span>
                <span className="text-cyan-400 font-semibold">15/06/2025</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen("cancel-subscription")}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Gerenciar Pagamento
          </button>
        </div>
      </div>

      {/* New Pricing Component Integration */}
      <Pricing
        plans={cloneGuardPlans}
        title="Escolha seu Plano CloneGuard"
        description={`Todos os planos incluem acesso à nossa plataforma, ferramentas de proteção e suporte dedicado.
Selecione o período de cobrança abaixo:`}
        setActiveScreen={setActiveScreen}
      />
    </div>
  )
}
