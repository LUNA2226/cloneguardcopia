"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Play } from "lucide-react"

const faqs = [
  {
    id: 1,
    question: "Posso usar o mesmo script em vários sites diferentes?",
    answer:
      "Não. O script é gerado de forma única para cada domínio autorizado. Ele contém verificações específicas do domínio original. Se for usado em outro site, o sistema não funcionará corretamente ou ativará sabotagem automaticamente.",
  },
  {
    id: 2,
    question: "O AntiClone protege mesmo que mudem o nome do domínio?",
    answer:
      "Sim. Se o domínio não for igual ao que você cadastrou na ferramenta, as proteções são ativadas — incluindo redirecionamento, sabotagem ou substituição de links.",
  },
  {
    id: 3,
    question: "A sabotagem visual quebra o site do clonado?",
    answer:
      "Sim. Essa é justamente a função dela. Ela faz o site parecer danificado, o que afasta visitantes e denuncia o clone.",
  },
  {
    id: 4,
    question: "Posso ativar todas as funções ao mesmo tempo?",
    answer:
      "Sim, mas não recomendado escolha de acordo sua estratégia. Se você quer recuperar tráfego ou conversão, evite ativar a sabotagem visual — ela pode afugentar o visitante antes dele ser redirecionado. Recomendamos ativar redirecionamento e substituição de links/checkaut para resultados discretos. Mas se quiser travar tudo mesmo, pode ativar todas juntas.",
  },
  {
    id: 5,
    question: "O que acontece se alguém clonar a página e colar em outro domínio?",
    answer:
      "O sistema detecta automaticamente e aplica as ações que você configurou: Redireciona, Sabota, Substitui links, Ou tudo ao mesmo tempo.",
  },
  {
    id: 6,
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim! Você pode cancelar/pausar/atualizar/fazer downgrade de sua assinatura a qualquer momento no painel.",
  },
]

export function TutorialsPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white text-center">Tutorial AntiClone</h1>
          <p className="text-gray-400 text-center mt-2 text-lg">Aprenda como proteger seu site contra clonagem</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Video Section */}
        <section className="mb-8">
          <div className="bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
              <div className="text-center">
                <Play className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-white font-medium text-lg">Vídeo Tutorial será inserido aqui</p>
                <p className="text-gray-400 text-sm mt-2">Espaço reservado para o vídeo explicativo</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Perguntas Frequentes (FAQ)</h2>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-700 rounded-lg overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-5 text-left bg-gray-750 hover:bg-gray-700 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span className="font-medium text-white pr-4">🔹 {faq.question}</span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {expandedFaq === faq.id && (
                    <div className="px-6 py-5 bg-gray-750 border-t border-gray-700">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-400">
          <p>© 2025 AntiClone. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
