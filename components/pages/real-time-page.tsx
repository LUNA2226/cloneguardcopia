import { Shield, AlertCircle, CheckCircle, Clock, Globe, ShieldOff } from "lucide-react"

export function RealTimePage() {
  // Mock data for real-time alerts
  const realtimeAlerts = [
    {
      id: 1,
      type: "clone_attempt",
      domain: "fake-clone123.site",
      timestamp: "2 segundos atrás",
      status: "blocked",
      location: "São Paulo, BR",
      ip: "192.168.1.1",
    },
    {
      id: 2,
      type: "protection_enabled",
      domain: "meusite.com.br",
      timestamp: "5 minutos atrás",
      status: "success",
    },
    {
      id: 3,
      type: "clone_attempt",
      domain: "scam-copy.xyz",
      timestamp: "10 minutos atrás",
      status: "blocked",
      location: "Lisboa, PT",
      ip: "192.168.1.100",
    },
    {
      id: 4,
      type: "warning",
      domain: "loja.meusite.com.br",
      timestamp: "15 minutos atrás",
      status: "warning",
      message: "Tentativa de cópia do checkout detectada",
    },
  ]

  const protectedDomains = [
    {
      domain: "meusite.com.br",
      status: "protected",
      lastCheck: "1 minuto atrás",
    },
    {
      domain: "loja.meusite.com.br",
      status: "warning",
      lastCheck: "5 minutos atrás",
    },
    {
      domain: "checkout.meusite.com.br",
      status: "protected",
      lastCheck: "3 minutos atrás",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Detecção em Tempo Real</h1>
          <p className="text-gray-400">Monitore tentativas de clonagem em tempo real</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Proteção Ativa</p>
              <h3 className="text-2xl font-bold text-green-400">3 domínios</h3>
            </div>
            <div className="p-2 rounded-lg bg-green-900/30 text-green-400">
              <Shield size={20} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tentativas Bloqueadas</p>
              <h3 className="text-2xl font-bold text-cyan-400">27 hoje</h3>
            </div>
            <div className="p-2 rounded-lg bg-cyan-900/30 text-cyan-400">
              <ShieldOff size={20} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Alertas Ativos</p>
              <h3 className="text-2xl font-bold text-yellow-400">2 alertas</h3>
            </div>
            <div className="p-2 rounded-lg bg-yellow-900/30 text-yellow-400">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protected Domains Status */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="mr-2 text-cyan-400" size={20} />
            Status dos Domínios
          </h2>
          <div className="space-y-4">
            {protectedDomains.map((domain) => (
              <div key={domain.domain} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                <div className="flex items-center">
                  <Globe size={16} className="text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium">{domain.domain}</p>
                    <p className="text-sm text-gray-400">{domain.lastCheck}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    domain.status === "protected"
                      ? "bg-green-900/30 text-green-400"
                      : "bg-yellow-900/30 text-yellow-400"
                  }`}
                >
                  {domain.status === "protected" ? "Protegido" : "Alerta"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2 text-cyan-400" size={20} />
            Atividade em Tempo Real
          </h2>
          <div className="space-y-4">
            {realtimeAlerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-gray-750 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {alert.type === "clone_attempt" ? (
                      <AlertCircle size={16} className="text-red-400 mt-1 mr-2" />
                    ) : alert.type === "protection_enabled" ? (
                      <CheckCircle size={16} className="text-green-400 mt-1 mr-2" />
                    ) : (
                      <AlertCircle size={16} className="text-yellow-400 mt-1 mr-2" />
                    )}
                    <div>
                      <p className="font-medium">
                        {alert.type === "clone_attempt"
                          ? "Tentativa de Clone Detectada"
                          : alert.type === "protection_enabled"
                            ? "Proteção Ativada"
                            : "Alerta de Segurança"}
                      </p>
                      <p className="text-sm text-gray-400">{alert.domain}</p>
                      {alert.location && (
                        <p className="text-sm text-gray-400">
                          {alert.location} • {alert.ip}
                        </p>
                      )}
                      {alert.message && <p className="text-sm text-gray-400">{alert.message}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{alert.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
