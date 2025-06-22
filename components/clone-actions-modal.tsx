"use client"

import { useState } from "react"
import { X, ExternalLink, ImageIcon, Link, Globe } from "lucide-react"

interface CloneActionsModalProps {
  clone: any
  onClose: () => void
}

export function CloneActionsModal({ clone, onClose }: CloneActionsModalProps) {
  const [settings, setSettings] = useState({
    redirectTraffic: false,
    visualSabotage: false,
    replaceLinks: false,
  })

  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <Globe className="text-cyan-400 mr-3" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Domínio Clonador</h2>
              <p className="text-sm text-gray-400 mt-1">{clone.domain}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Clone Preview Link */}
        <div className="bg-gray-750 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Página Clonada:</span>
            <a
              href={clone.cloneUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm"
            >
              <ExternalLink size={14} className="mr-1" />
              Visualizar página
            </a>
          </div>
        </div>

        {/* Automatic Actions */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Ações Automáticas</h3>

          <div className="space-y-4">
            {/* Redirect Traffic */}
            <div className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    settings.redirectTraffic ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-700 text-gray-300"
                  }`}
                >
                  <ExternalLink size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Redirecionar tráfego de clones</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Quando ativado, força o redirecionamento automático para o site original.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={settings.redirectTraffic}
                  onChange={() => toggleSetting("redirectTraffic")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* Visual Sabotage */}
            <div className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    settings.visualSabotage ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-700 text-gray-300"
                  }`}
                >
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Ativar sabotagem visual</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Quando ativado, deixa a página do clone com visual turvo ou quebrado.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={settings.visualSabotage}
                  onChange={() => toggleSetting("visualSabotage")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* Replace Links */}
            <div className="flex items-start justify-between p-4 bg-gray-750 rounded-lg">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    settings.replaceLinks ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-700 text-gray-300"
                  }`}
                >
                  <Link size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Substituir links do clone</h4>
                  <p className="text-sm text-gray-400 mt-1">Troca todos os links de checkout para o correto.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={settings.replaceLinks}
                  onChange={() => toggleSetting("replaceLinks")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">Salvar Alterações</button>
        </div>
      </div>
    </div>
  )
}
