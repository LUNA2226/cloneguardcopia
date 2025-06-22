"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, ExternalLink, RotateCcw, ImageIcon, Zap, RefreshCw, Play, Globe } from "lucide-react"

interface ActionScreenProps {
  domain: any
  onBack: () => void
}

export function ActionScreen({ domain, onBack }: ActionScreenProps) {
  const [actions, setActions] = useState({
    redirect: true,
    replaceLinks: true,
    replaceImages: false,
    blur: false,
    alternateCheckout: false,
  })

  const toggleAction = (action: keyof typeof actions) => {
    setActions((prev) => ({
      ...prev,
      [action]: !prev[action],
    }))
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-3 p-2 rounded-full hover:bg-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Ações Anti-Clonagem</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-5 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mr-4">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{domain ? domain.domain : "producao.recitest.com"}</h2>
            <p className="text-gray-400 text-sm">
              {domain ? `${domain.location} • ${domain.ip}` : "Brasil, SP • 192.168.1.1"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-300">
          <div>
            <span className="block text-gray-400">Último acesso:</span>
            <span>{domain ? domain.lastAccess : "2 min atrás"}</span>
          </div>
          <div>
            <span className="block text-gray-400">Dispositivo:</span>
            <span>{domain ? domain.device : "iPhone"}</span>
          </div>
          <div>
            <span className="block text-gray-400">Total de acessos:</span>
            <span>{domain ? domain.accessCount : "127"}</span>
          </div>
          <div>
            <span className="block text-gray-400">Primeira detecção:</span>
            <span>27/04/2023 15:32</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Ações Disponíveis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ActionCard
          icon={<ExternalLink size={20} />}
          title="Redirecionar tráfego"
          description="Redirecionar todo tráfego para sua página oficial"
          active={actions.redirect}
          onToggle={() => toggleAction("redirect")}
        />
        <ActionCard
          icon={<RotateCcw size={20} />}
          title="Substituir links"
          description="Substituir links do clone pelo original"
          active={actions.replaceLinks}
          onToggle={() => toggleAction("replaceLinks")}
        />
        <ActionCard
          icon={<ImageIcon size={20} />}
          title="Trocar imagens"
          description="Substituir imagens do site clonado"
          active={actions.replaceImages}
          onToggle={() => toggleAction("replaceImages")}
        />
        <ActionCard
          icon={<Zap size={20} />}
          title="Modo zoeira"
          description="Deixar tela turva ou bugada"
          active={actions.blur}
          onToggle={() => toggleAction("blur")}
        />
        <ActionCard
          icon={<RefreshCw size={20} />}
          title="Alternar checkouts"
          description="A cada 10 acessos, 3 vão pro seu checkout original"
          active={actions.alternateCheckout}
          onToggle={() => toggleAction("alternateCheckout")}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center">
          <Play size={18} className="mr-2" />
          Testar ação
        </button>
        <button className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500">Aplicar ações selecionadas</button>
      </div>
    </div>
  )
}

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  active: boolean
  onToggle: () => void
}

function ActionCard({ icon, title, description, active, onToggle }: ActionCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        active ? "bg-cyan-900/20 border-cyan-500/50" : "bg-gray-800 border-gray-700"
      }`}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-lg mr-3 ${active ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-700 text-gray-300"}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={active} onChange={onToggle} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>
    </div>
  )
}
