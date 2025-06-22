/**
 * Este script gera um HTML de teste que pode ser usado para testar o script de proteção em um navegador
 * Ele cria uma página HTML que simula um site clonado e carrega o script de proteção
 */

// Configurações
const ORIGINAL_DOMAIN = "minhapagina.com.br"
const API_BASE_URL = "http://localhost:3000"

async function generateTestHtml() {
  try {
    console.log("🔍 Gerando HTML de teste para o script de proteção...")

    // 1. Gerar o script mínimo para o domínio original
    console.log("1️⃣ Obtendo script de proteção...")

    const scriptResponse = await fetch(`${API_BASE_URL}/api/simple-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: ORIGINAL_DOMAIN }),
    })

    if (!scriptResponse.ok) {
      throw new Error(`Erro ao gerar script: ${scriptResponse.status}`)
    }

    const scriptData = await scriptResponse.json()
    const minimalScript = scriptData.script

    console.log("✅ Script obtido com sucesso")

    // 2. Gerar HTML de teste
    console.log("2️⃣ Gerando HTML de teste...")

    const testHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Clonado - Teste</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        .product {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .product img {
            max-width: 100%;
            height: auto;
        }
        .price {
            font-size: 24px;
            font-weight: bold;
            color: #e44d26;
        }
        .btn {
            display: inline-block;
            background: #e44d26;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
        }
        footer {
            margin-top: 30px;
            text-align: center;
            background-color: #f4f4f4;
            padding: 10px;
        }
    </style>
    ${minimalScript}
</head>
<body>
    <header>
        <h1>Minha Página - Ofertas Especiais</h1>
        <p>As melhores ofertas você encontra aqui!</p>
    </header>
    
    <main>
        <div class="product">
            <img src="https://via.placeholder.com/400x300" alt="Produto 1">
            <h2>Curso Online Premium</h2>
            <p>Aprenda as melhores técnicas com nosso curso exclusivo.</p>
            <div class="price">R$ 197,00</div>
            <a href="/checkout" class="btn">Comprar Agora</a>
        </div>
        
        <div class="product">
            <img src="https://via.placeholder.com/400x300" alt="Produto 2">
            <h2>E-book Completo</h2>
            <p>Mais de 300 páginas de conteúdo exclusivo para você.</p>
            <div class="price">R$ 47,00</div>
            <a href="/finalizar-compra" class="btn">Adicionar ao Carrinho</a>
        </div>
    </main>
    
    <footer>
        <p>&copy; 2023 Minha Página - Todos os direitos reservados</p>
    </footer>
</body>
</html>
    `

    console.log("✅ HTML de teste gerado com sucesso")
    console.log("\n📋 Instruções para teste:")
    console.log("1. Copie o HTML abaixo")
    console.log("2. Salve em um arquivo .html")
    console.log("3. Abra o arquivo no navegador")
    console.log("4. Observe as proteções sendo aplicadas")
    console.log("\n📝 HTML de teste:")
    console.log(testHtml)
  } catch (error) {
    console.error("❌ Erro ao gerar HTML de teste:", error)
  }
}

// Executar a geração do HTML de teste
generateTestHtml()
