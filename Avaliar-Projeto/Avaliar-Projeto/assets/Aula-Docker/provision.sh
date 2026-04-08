#!/bin/bash

# Script de Provisionamento Docker

echo "🚀 Iniciando provisionamento do ambiente Docker..."

# Verifica se o Docker está rodando
if ! docker info >/dev/null 2>&1; then
    echo "❌ Erro: O Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

echo "📦 Construindo e subindo os containers..."
docker-compose up -d --build

echo "✅ Ambiente provisionado com sucesso!"
echo "📍 API rodando em: http://localhost:3333"
echo "📍 PostgreSQL (Bitnami) rodando na porta: 5432"
echo "🛠️ Tech Stack: Node 24.13.1, Fastify v5, Prisma v7.4.0, Tailwind v4"
echo "📄 Parâmetros salvos em: app_criado"
echo "📚 Documentação de Tecnologias: src/Documentação/Tecnologias.html"

# Exibe os logs da API por um momento
docker-compose logs -f api
