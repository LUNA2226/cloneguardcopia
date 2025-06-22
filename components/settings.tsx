"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Globe, Copy, Check, Shield, AlertTriangle } from "lucide-react"

export function Settings() {
  const [selectedDomain, setSelectedDomain] = useState("minhapagina.com.br")
  const [copied, setCopied] = useState(false)
  const [minimalScript, setMinimalScript] = useState<string>("// Selecione um domínio para gerar o script")
  const [isLoadingScript, setIsLoadingScript] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptSize, setScriptSize] = useState(0)
  const [clipboardError, setClipboardError] = useState<string | null>(null)
  const scriptRef = useRef<HTMLPreElement>(null)

  const domains = ["minhapagina.com.br", "ofertaespecial.com", "cursoonline.net"]

  const fetchMinimalScript = useCallback(async (domain: string) => {
    if (!domain) return

    setIsLoadingScript(true)
    setMinimalScript(`// Gerando script para ${domain}...`)
    setCopied(false)
    setError(null)
    setClipboardError(null)

    try {
      // Use the new simplified endpoint
      const response = await fetch("/api/simple-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      })

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // Fallback para texto simples se não for JSON
        const text = await response.text()
        console.error("API returned non-JSON response:", text.substring(0, 100))
        throw new Error(`API retornou formato inválido: ${contentType}`)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${data.error || "Erro desconhecido"}`)
      }

      if (data.script) {
        setMinimalScript(data.script)
        setScriptSize(data.size)
      } else {
        throw new Error("API não retornou o script")
      }
    } catch (error) {
      console.error("Erro ao gerar script:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")

      // Fornecer um script de fallback para que o usuário tenha algo para copiar
      setMinimalScript(
        `<script>(function(){var d=document;var s=d.createElement('script');s.async=1;s.src='/api/s?d=${encodeURIComponent(domain)}';d.head.appendChild(s)})();</script>`,
      )
      setScriptSize(0)
    } finally {
      setIsLoadingScript(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDomain) {
      fetchMinimalScript(selectedDomain)
    }
  }, [selectedDomain, fetchMinimalScript])

  const handleCopy = async () => {
    if (!minimalScript || isLoadingScript || minimalScript.startsWith("//")) return

    setClipboardError(null)

    try {
      await navigator.clipboard.writeText(minimalScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erro ao copiar para área de transferência:", error)

      // Tenta selecionar o texto para facilitar a cópia manual
      if (scriptRef.current) {
        try {
          const range = document.createRange()
          range.selectNodeContents(scriptRef.current)
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
          }
          setClipboardError("Selecione o script e use Ctrl+C/Cmd+C para copiar")
        } catch (selectionError) {
          setClipboardError("Use Ctrl+C/Cmd+C para copiar o script selecionado")
        }
      } else {
        setClipboardError("Não foi possível copiar automaticamente. Por favor, selecione o script manualmente.")
      }
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Script de Proteção</h1>

      <div className="space-y-6">
        {/* Domain Selector */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Globe className="text-cyan-400 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Selecione seu Domínio</h2>
          </div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-200"
          >
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </section>

        {/* Minimal Script */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="text-green-400 mr-2" size={20} />
              <h2 className="text-lg font-semibold">Seu Script de Proteção</h2>
            </div>
            <div className="flex items-center space-x-3">
              {scriptSize > 0 && (
                <>
                  <span className="text-xs text-gray-400">{scriptSize} caracteres</span>
                  <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">✓ Ultra-compacto</span>
                  <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">✓ Obfuscado</span>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300 flex items-start">
              <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          )}

          <div
            className="bg-gray-900 rounded-lg p-4 font-mono text-sm relative min-h-[80px] group"
            onClick={() => {
              if (scriptRef.current) {
                const range = document.createRange()
                range.selectNodeContents(scriptRef.current)
                const selection = window.getSelection()
                if (selection) {
                  selection.removeAllRanges()
                  selection.addRange(range)
                }
              }
            }}
          >
            <pre ref={scriptRef} className="whitespace-pre-wrap text-gray-300 break-all cursor-pointer">
              {minimalScript}
            </pre>
            <div className="absolute inset-0 bg-gray-800 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg pointer-events-none"></div>
          </div>

          {clipboardError && (
            <div className="mt-2 text-xs text-amber-400 flex items-center">
              <AlertTriangle size={12} className="mr-1" />
              {clipboardError}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Script mínimo que carrega dinamicamente as proteções do servidor com base nas suas configurações
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                disabled={isLoadingScript || !minimalScript || minimalScript.startsWith("//")}
                className="flex items-center px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copiar Script
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Como Usar</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-cyan-400 text-xl font-bold">1.</span>
              <div>
                <h3 className="font-medium text-gray-200">Copie o Script</h3>
                <p className="text-sm text-gray-400">
                  Use o botão "Copiar Script" ou clique no código e use Ctrl+C/Cmd+C
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-cyan-400 text-xl font-bold">2.</span>
              <div>
                <h3 className="font-medium text-gray-200">Cole no seu Site</h3>
                <p className="text-sm text-gray-400">
                  Insira na seção <code className="bg-gray-700 px-1 rounded">&lt;head&gt;</code> do seu HTML
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-xl font-bold">✓</span>
              <div>
                <h3 className="font-medium text-gray-200">Proteção Ativa</h3>
                <p className="text-sm text-gray-400">O script detecta clones automaticamente e aplica suas proteções</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recursos Inclusos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">Detecção automática de clones</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">Interferência visual avançada</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">Substituição de imagens</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">Correção de links de checkout</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">Rastreamento de cliques</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">Análise de tempo na página</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">Registro no banco de dados</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">Proteção contra requisições externas</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
