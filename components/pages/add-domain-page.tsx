"use client"
import { ArrowLeft, Globe, Shield, AlertCircle } from "lucide-react"

interface AddDomainPageProps {
  onBack: () => void
}

export function AddDomainPage({ onBack }: AddDomainPageProps) {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-3 p-2 rounded-full hover:bg-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Adicionar Novo Domínio</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Domain Input Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Globe className="text-cyan-400 mr-2" size={24} />
            <h2 className="text-lg font-semibold">Informações do Domínio</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL do Domínio</label>
              <input
                type="url"
                placeholder="www.meudominio.com"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <p className="mt-1 text-xs text-gray-400">Digite o domínio principal que deseja proteger</p>
            </div>

            <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-200">Importante</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Certifique-se de que você tem acesso ao código-fonte do site para adicionar o script de proteção
                    posteriormente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plan Info Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Shield className="text-cyan-400 mr-2" size={24} />
            <h2 className="text-lg font-semibold">Plano Atual</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg border border-gray-700">
            <div>
              <h3 className="font-medium text-gray-200">Plano Premium</h3>
              <p className="text-sm text-gray-400 mt-1">2 domínios restantes de 5</p>
            </div>
            <div className="text-2xl font-bold text-cyan-400">3/5</div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onBack} className="px-4 py-2 text-sm text-gray-300 hover:text-white">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">Adicionar Domínio</button>
        </div>
      </div>
    </div>
  )
}
