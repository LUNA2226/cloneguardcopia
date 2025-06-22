"use client"

import { useState } from "react"
import { Globe, Smartphone, Monitor, ExternalLink } from "lucide-react"
import { CloneActionsModal } from "./clone-actions-modal"

interface CloneTableProps {
  limit?: number
  onViewActions?: (site: any) => void
}

export function CloneTable({ limit, onViewActions }: CloneTableProps) {
  const [selectedClone, setSelectedClone] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock data for demonstration
  const cloneSites = [
    {
      id: 1,
      domain: "producao.recitest.com",
      ip: "192.168.1.1",
      location: "Brasil, SP",
      lastAccess: "2 min atrás",
      device: "iPhone",
      accessCount: 127,
      cloneUrl: "https://clone1.fake.com",
    },
    {
      id: 2,
      domain: "copiaoferta.site",
      ip: "45.67.89.10",
      location: "Portugal, Lisboa",
      lastAccess: "15 min atrás",
      device: "Android",
      accessCount: 89,
    },
    {
      id: 3,
      domain: "cloneprodutos.xyz",
      ip: "112.45.67.89",
      location: "EUA, CA",
      lastAccess: "1 hora atrás",
      device: "Windows",
      accessCount: 345,
    },
    {
      id: 4,
      domain: "ofertafalsa.com.br",
      ip: "78.90.12.34",
      location: "Brasil, RJ",
      lastAccess: "3 horas atrás",
      device: "Mac",
      accessCount: 56,
    },
    {
      id: 5,
      domain: "cursocopia.net",
      ip: "192.45.67.89",
      location: "México, MX",
      lastAccess: "5 horas atrás",
      device: "Android",
      accessCount: 211,
    },
    {
      id: 6,
      domain: "fraudesite.org",
      ip: "34.56.78.90",
      location: "Colômbia, BO",
      lastAccess: "1 dia atrás",
      device: "Windows",
      accessCount: 78,
    },
  ]

  const handleViewActions = (site: any) => {
    setSelectedClone(site)
    setIsModalOpen(true)
  }

  const displayedSites = limit ? cloneSites.slice(0, limit) : cloneSites

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "iphone":
      case "android":
        return <Smartphone size={16} className="mr-1" />
      default:
        return <Monitor size={16} className="mr-1" />
    }
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg bg-gray-800">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Domínio</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">IP / Localização</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Último Acesso</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Dispositivo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Acessos</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayedSites.map((site) => (
              <tr key={site.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Globe size={16} className="text-cyan-400 mr-2" />
                    <span className="font-medium">{site.domain}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <span className="text-gray-400">{site.ip}</span>
                  </div>
                  <div className="text-xs text-gray-500">{site.location}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{site.lastAccess}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    {getDeviceIcon(site.device)}
                    <span>{site.device}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{site.accessCount}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleViewActions(site)}
                    className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 flex items-center"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    Ver ações
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedClone && (
        <CloneActionsModal clone={selectedClone} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}
