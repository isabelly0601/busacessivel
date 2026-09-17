# Script de Provisionamento Docker para Windows (PowerShell)

Write-Host "🚀 Iniciando provisionamento do ambiente Docker..." -ForegroundColor Cyan

# Verifica se o Docker está rodando
try {
    docker info >$null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Erro: O Docker não está rodando. Por favor, inicie o Docker Desktop primeiro."
        exit
    }
} catch {
    Write-Error "❌ Erro: Certifique-se de que o Docker está instalado e no seu PATH."
    exit
}

Write-Host "📦 Construindo e subindo os containers..." -ForegroundColor Yellow
docker-compose up -d --build

Write-Host "✅ Ambiente provisionado com sucesso!" -ForegroundColor Green
Write-Host "📍 API rodando em: http://localhost:3333" -ForegroundColor White
Write-Host "📍 PostgreSQL (Bitnami) rodando na porta: 5432" -ForegroundColor White
Write-Host "🛠️ Tech Stack: Node 24.13.1, Fastify v5, Prisma v7.4.0, Tailwind v4" -ForegroundColor White
Write-Host "📄 Parâmetros salvos em: app_criado" -ForegroundColor White
Write-Host "📚 Documentação de Tecnologias: src/Documentação/Tecnologias.html" -ForegroundColor White

Write-Host "`n👀 Acompanhando os logs da API (Pressione Ctrl+C para sair)..." -ForegroundColor Gray
docker-compose logs -f api
