#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 🎓 AGENTE AVALIADOR DE PROJETO ACADÊMICO — Scanner Automatizado
# ═══════════════════════════════════════════════════════════════
# Este script escaneia o codebase e coleta dados técnicos
# para alimentar o relatório de avaliação.
# Saída: /tmp/aproagua_avaliacao_dados.txt
# ═══════════════════════════════════════════════════════════════

set -e

# Detectar raiz do projeto
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUTPUT="/tmp/aproagua_avaliacao_dados.txt"

echo "🔍 Iniciando análise do codebase em: $PROJECT_ROOT"
echo ""

# Limpar output anterior
> "$OUTPUT"

cat >> "$OUTPUT" << 'HEADER'
═══════════════════════════════════════════════════════════════
  RELATÓRIO DE ANÁLISE AUTOMATIZADA DO CODEBASE
  Gerado por: Agente Avaliador de Projeto Acadêmico
═══════════════════════════════════════════════════════════════
HEADER

echo "Data da análise: $(date '+%d/%m/%Y às %H:%M:%S')" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# ─────────────────────────────────────────
# 1. ANÁLISE DO FRONTEND (aproagua-web)
# ─────────────────────────────────────────
echo "═══ FRONTEND (aproagua-web) ═══" >> "$OUTPUT"

WEB_PKG="$PROJECT_ROOT/aproagua-web/package.json"
if [ -f "$WEB_PKG" ]; then
    echo "✅ package.json encontrado" >> "$OUTPUT"
    
    # Extrair versões das dependências
    echo "" >> "$OUTPUT"
    echo "-- Dependências de Produção --" >> "$OUTPUT"
    
    check_dep() {
        local pkg_file="$1"
        local dep_name="$2"
        local display_name="$3"
        local version
        version=$(grep "\"$dep_name\"" "$pkg_file" 2>/dev/null | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
        if [ -n "$version" ]; then
            echo "  ✅ $display_name: $version" >> "$OUTPUT"
        else
            echo "  ❌ $display_name: NÃO ENCONTRADO" >> "$OUTPUT"
        fi
    }
    
    # Frontend deps
    check_dep "$WEB_PKG" "next" "Next.js"
    check_dep "$WEB_PKG" "react\"" "React"
    check_dep "$WEB_PKG" "react-dom" "React DOM"
    check_dep "$WEB_PKG" "typescript" "TypeScript"
    check_dep "$WEB_PKG" "tailwindcss" "TailwindCSS"
    check_dep "$WEB_PKG" "lucide-react" "Lucide React"
    check_dep "$WEB_PKG" "@tiptap/react" "TipTap (React)"
    check_dep "$WEB_PKG" "@prisma/client" "Prisma Client"
    check_dep "$WEB_PKG" "clsx" "clsx"
    check_dep "$WEB_PKG" "tailwind-merge" "tailwind-merge"
    check_dep "$WEB_PKG" "xlsx" "xlsx (SheetJS)"
    check_dep "$WEB_PKG" "jsbarcode" "JsBarcode"
    check_dep "$WEB_PKG" "qrcode.react" "qrcode.react"
    check_dep "$WEB_PKG" "eslint" "ESLint"
    check_dep "$WEB_PKG" "eslint-config-next" "ESLint Next Config"
    check_dep "$WEB_PKG" "@tailwindcss/postcss" "TailwindCSS PostCSS"
    check_dep "$WEB_PKG" "@prisma/adapter-pg" "Prisma Adapter PG"
    check_dep "$WEB_PKG" "prisma\"" "Prisma CLI"
    check_dep "$WEB_PKG" "ts-node" "ts-node"
    
    echo "" >> "$OUTPUT"
    echo "-- Dependências NÃO mapeadas (possíveis extras) --" >> "$OUTPUT"
    
    # Lista de deps conhecidas
    KNOWN_DEPS="next|react|react-dom|typescript|tailwindcss|lucide-react|@tiptap|@prisma|clsx|tailwind-merge|xlsx|jsbarcode|qrcode.react|eslint|@tailwindcss|prisma|ts-node|@types"
    
    # Encontrar deps extras no frontend
    grep '"@\|"[a-z]' "$WEB_PKG" | grep -v "name\|version\|private\|scripts\|main\|license\|author\|description\|keywords\|seed\|prisma" | grep -vE "$KNOWN_DEPS" | while read -r line; do
        dep_name=$(echo "$line" | sed 's/.*"\([^"]*\)".*/\1/' | head -1)
        if [ -n "$dep_name" ] && [ "$dep_name" != "{" ] && [ "$dep_name" != "}" ]; then
            echo "  ⚠️  EXTRA: $dep_name (NÃO CONSTA NA LISTA OFICIAL)" >> "$OUTPUT"
        fi
    done
    
else
    echo "❌ package.json NÃO encontrado em aproagua-web/" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# ─────────────────────────────────────────
# 2. ANÁLISE DO BACKEND (aproagua-api)
# ─────────────────────────────────────────
echo "═══ BACKEND (aproagua-api) ═══" >> "$OUTPUT"

API_PKG="$PROJECT_ROOT/aproagua-api/package.json"
if [ -f "$API_PKG" ]; then
    echo "✅ package.json encontrado" >> "$OUTPUT"
    
    echo "" >> "$OUTPUT"
    echo "-- Dependências de Produção --" >> "$OUTPUT"
    
    check_dep "$API_PKG" "fastify\"" "Fastify"
    check_dep "$API_PKG" "typescript" "TypeScript"
    check_dep "$API_PKG" "@prisma/client" "Prisma Client"
    check_dep "$API_PKG" "zod" "Zod"
    check_dep "$API_PKG" "bcryptjs" "bcryptjs"
    check_dep "$API_PKG" "@fastify/multipart" "@fastify/multipart"
    check_dep "$API_PKG" "@fastify/cors" "@fastify/cors"
    check_dep "$API_PKG" "pdfkit" "PDFKit"
    check_dep "$API_PKG" "pg\"" "pg (node-postgres)"
    check_dep "$API_PKG" "dotenv" "dotenv"
    check_dep "$API_PKG" "vitest" "Vitest"
    check_dep "$API_PKG" "ts-node-dev" "ts-node-dev"
    check_dep "$API_PKG" "@prisma/adapter-pg" "Prisma Adapter PG"
    check_dep "$API_PKG" "prisma\"" "Prisma CLI"
    check_dep "$API_PKG" "fastify-type-provider-zod" "Fastify Zod Provider"
    
    echo "" >> "$OUTPUT"
    echo "-- Dependências NÃO mapeadas (possíveis extras) --" >> "$OUTPUT"
    
    KNOWN_API_DEPS="fastify|typescript|@prisma|zod|bcryptjs|@fastify|pdfkit|pg|dotenv|vitest|ts-node|prisma|@types"
    
    grep '"@\|"[a-z]' "$API_PKG" | grep -v "name\|version\|main\|scripts\|license\|author\|description\|keywords\|seed\|prisma" | grep -vE "$KNOWN_API_DEPS" | while read -r line; do
        dep_name=$(echo "$line" | sed 's/.*"\([^"]*\)".*/\1/' | head -1)
        if [ -n "$dep_name" ] && [ "$dep_name" != "{" ] && [ "$dep_name" != "}" ]; then
            echo "  ⚠️  EXTRA: $dep_name (NÃO CONSTA NA LISTA OFICIAL)" >> "$OUTPUT"
        fi
    done
    
else
    echo "❌ package.json NÃO encontrado em aproagua-api/" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# ─────────────────────────────────────────
# 3. ANÁLISE DE INFRAESTRUTURA
# ─────────────────────────────────────────
echo "═══ INFRAESTRUTURA ═══" >> "$OUTPUT"

# Docker
if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    echo "✅ docker-compose.yml encontrado" >> "$OUTPUT"
    CONTAINERS=$(grep "container_name:" "$PROJECT_ROOT/docker-compose.yml" | wc -l | tr -d ' ')
    echo "   Containers definidos: $CONTAINERS" >> "$OUTPUT"
    grep "container_name:" "$PROJECT_ROOT/docker-compose.yml" | while read -r line; do
        echo "   - $(echo "$line" | sed 's/.*: *//')" >> "$OUTPUT"
    done
else
    echo "❌ docker-compose.yml NÃO encontrado" >> "$OUTPUT"
fi

if [ -f "$PROJECT_ROOT/docker-compose.dev.yml" ]; then
    echo "✅ docker-compose.dev.yml encontrado (ambiente dev)" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# Dockerfiles
echo "-- Dockerfiles --" >> "$OUTPUT"
for svc in aproagua-web aproagua-api; do
    if [ -f "$PROJECT_ROOT/$svc/Dockerfile" ]; then
        echo "  ✅ $svc/Dockerfile presente" >> "$OUTPUT"
    else
        echo "  ❌ $svc/Dockerfile AUSENTE" >> "$OUTPUT"
    fi
done

echo "" >> "$OUTPUT"

# PostgreSQL (via Docker)
echo "-- Banco de Dados --" >> "$OUTPUT"
if grep -q "bitnami/postgresql" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null; then
    PG_IMAGE=$(grep "bitnami/postgresql" "$PROJECT_ROOT/docker-compose.yml" | sed 's/.*image: *//')
    echo "  ✅ PostgreSQL via Bitnami: $PG_IMAGE" >> "$OUTPUT"
else
    echo "  ❌ Imagem Bitnami PostgreSQL NÃO encontrada" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# Nginx
echo "-- Reverse Proxy --" >> "$OUTPUT"
if [ -d "$PROJECT_ROOT/nginx/conf.d" ]; then
    echo "  ✅ Nginx conf.d/ encontrado" >> "$OUTPUT"
    ls "$PROJECT_ROOT/nginx/conf.d/" 2>/dev/null | while read -r f; do
        echo "    - $f" >> "$OUTPUT"
    done
else
    echo "  ❌ Diretório nginx/conf.d/ NÃO encontrado" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# Certbot / SSL
echo "-- Segurança SSL --" >> "$OUTPUT"
if grep -rq "certbot\|ssl_certificate\|443" "$PROJECT_ROOT/nginx/" 2>/dev/null; then
    echo "  ✅ Configuração SSL/Certbot detectada no Nginx" >> "$OUTPUT"
    grep -r "ssl_certificate\|certbot" "$PROJECT_ROOT/nginx/" 2>/dev/null | head -5 | while read -r line; do
        echo "    $line" >> "$OUTPUT"
    done
else
    echo "  ⚠️  Configuração SSL/Certbot NÃO detectada localmente (pode estar apenas na VPS)" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# Git
echo "-- Versionamento --" >> "$OUTPUT"
if [ -d "$PROJECT_ROOT/.git" ]; then
    echo "  ✅ Repositório Git inicializado" >> "$OUTPUT"
    
    # Remote
    REMOTE=$(cd "$PROJECT_ROOT" && git remote -v 2>/dev/null | head -1)
    if [ -n "$REMOTE" ]; then
        echo "  ✅ Remote configurado: $REMOTE" >> "$OUTPUT"
        if echo "$REMOTE" | grep -q "github"; then
            echo "  📍 Plataforma: GitHub" >> "$OUTPUT"
        elif echo "$REMOTE" | grep -q "bitbucket"; then
            echo "  📍 Plataforma: Bitbucket" >> "$OUTPUT"
        else
            echo "  📍 Plataforma: Outro" >> "$OUTPUT"
        fi
    else
        echo "  ❌ Nenhum remote configurado" >> "$OUTPUT"
    fi
    
    # Commits stats
    TOTAL_COMMITS=$(cd "$PROJECT_ROOT" && git rev-list --count HEAD 2>/dev/null || echo "0")
    echo "  📊 Total de commits: $TOTAL_COMMITS" >> "$OUTPUT"
    
    FIRST_COMMIT_DATE=$(cd "$PROJECT_ROOT" && git log --reverse --format="%ad" --date=short 2>/dev/null | head -1)
    LAST_COMMIT_DATE=$(cd "$PROJECT_ROOT" && git log -1 --format="%ad" --date=short 2>/dev/null)
    echo "  📅 Primeiro commit: $FIRST_COMMIT_DATE" >> "$OUTPUT"
    echo "  📅 Último commit: $LAST_COMMIT_DATE" >> "$OUTPUT"
    
    # Últimos 10 commits
    echo "" >> "$OUTPUT"
    echo "  -- Últimos 10 commits --" >> "$OUTPUT"
    cd "$PROJECT_ROOT" && git log --oneline -10 --format="    %h | %ad | %s" --date=short 2>/dev/null >> "$OUTPUT"
    
else
    echo "  ❌ Repositório Git NÃO inicializado" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# ─────────────────────────────────────────
# 4. ANÁLISE ARQUITETURAL
# ─────────────────────────────────────────
echo "═══ ARQUITETURA ═══" >> "$OUTPUT"

# Frontend structure
echo "-- Estrutura Frontend --" >> "$OUTPUT"
if [ -d "$PROJECT_ROOT/aproagua-web/src/app" ]; then
    ROUTES=$(find "$PROJECT_ROOT/aproagua-web/src/app" -name "page.tsx" -o -name "page.ts" 2>/dev/null | wc -l | tr -d ' ')
    echo "  📁 Rotas (pages): $ROUTES" >> "$OUTPUT"
    find "$PROJECT_ROOT/aproagua-web/src/app" -maxdepth 2 -name "page.tsx" 2>/dev/null | while read -r f; do
        route=$(echo "$f" | sed "s|$PROJECT_ROOT/aproagua-web/src/app||" | sed 's|/page.tsx||')
        [ -z "$route" ] && route="/"
        echo "    $route" >> "$OUTPUT"
    done
fi

echo "" >> "$OUTPUT"

if [ -d "$PROJECT_ROOT/aproagua-web/src/components" ]; then
    COMPONENTS=$(find "$PROJECT_ROOT/aproagua-web/src/components" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    echo "  📦 Total de componentes (.tsx): $COMPONENTS" >> "$OUTPUT"
    
    # Check for modular structure
    echo "  📂 Diretórios de componentes:" >> "$OUTPUT"
    ls -d "$PROJECT_ROOT/aproagua-web/src/components"/*/ 2>/dev/null | while read -r d; do
        dirname=$(basename "$d")
        count=$(find "$d" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
        echo "    /$dirname/ ($count arquivos .tsx)" >> "$OUTPUT"
    done
fi

echo "" >> "$OUTPUT"

# Backend structure
echo "-- Estrutura Backend --" >> "$OUTPUT"
if [ -d "$PROJECT_ROOT/aproagua-api/src" ]; then
    echo "  📂 Diretórios em src/:" >> "$OUTPUT"
    ls -d "$PROJECT_ROOT/aproagua-api/src"/*/ 2>/dev/null | while read -r d; do
        dirname=$(basename "$d")
        count=$(find "$d" -type f 2>/dev/null | wc -l | tr -d ' ')
        echo "    /$dirname/ ($count arquivos)" >> "$OUTPUT"
    done
    
    # Check for route files
    ROUTE_FILES=$(find "$PROJECT_ROOT/aproagua-api/src" -name "*.routes.ts" -o -name "*.route.ts" 2>/dev/null | wc -l | tr -d ' ')
    echo "  🔀 Arquivos de rotas: $ROUTE_FILES" >> "$OUTPUT"
    
    # Check for vertical slice pattern
    if [ -d "$PROJECT_ROOT/aproagua-api/src/features" ] || [ -d "$PROJECT_ROOT/aproagua-api/src/modules" ] || [ -d "$PROJECT_ROOT/aproagua-api/src/slices" ]; then
        echo "  ✅ Padrão Vertical Slice / Modular DETECTADO" >> "$OUTPUT"
    else
        echo "  ⚠️  Padrão Vertical Slice não detectado por convenção de diretório" >> "$OUTPUT"
    fi
fi

echo "" >> "$OUTPUT"

# Prisma
echo "-- ORM Prisma --" >> "$OUTPUT"
for svc in aproagua-web aproagua-api; do
    SCHEMA="$PROJECT_ROOT/$svc/prisma/schema.prisma"
    if [ -f "$SCHEMA" ]; then
        MODELS=$(grep "^model " "$SCHEMA" 2>/dev/null | wc -l | tr -d ' ')
        echo "  ✅ $svc/prisma/schema.prisma ($MODELS modelos)" >> "$OUTPUT"
        grep "^model " "$SCHEMA" 2>/dev/null | while read -r line; do
            echo "    - $line" >> "$OUTPUT"
        done
    else
        echo "  ❌ $svc/prisma/schema.prisma NÃO encontrado" >> "$OUTPUT"
    fi
done

echo "" >> "$OUTPUT"

# ─────────────────────────────────────────
# 5. MÉTRICAS GERAIS
# ─────────────────────────────────────────
echo "═══ MÉTRICAS GERAIS ═══" >> "$OUTPUT"

# Contagem de linhas por tipo
echo "-- Contagem de Arquivos --" >> "$OUTPUT"
for ext in tsx ts css json; do
    count=$(find "$PROJECT_ROOT/aproagua-web/src" "$PROJECT_ROOT/aproagua-api/src" -name "*.$ext" 2>/dev/null | wc -l | tr -d ' ')
    echo "  .$ext: $count arquivos" >> "$OUTPUT"
done

echo "" >> "$OUTPUT"
echo "-- Linhas de Código (aproximado) --" >> "$OUTPUT"
for svc in aproagua-web aproagua-api; do
    if [ -d "$PROJECT_ROOT/$svc/src" ]; then
        lines=$(find "$PROJECT_ROOT/$svc/src" -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | tr -d ' ' | sed 's/total//')
        echo "  $svc: ~${lines} linhas TypeScript" >> "$OUTPUT"
    fi
done

echo "" >> "$OUTPUT"

# Backup container
echo "-- Backup --" >> "$OUTPUT"
if grep -q "backup" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null; then
    echo "  ✅ Container de backup configurado" >> "$OUTPUT"
    if grep -q "alpine" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null; then
        echo "  ✅ Baseado em Alpine Linux" >> "$OUTPUT"
    fi
else
    echo "  ❌ Container de backup NÃO configurado" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "═══ FIM DA ANÁLISE AUTOMATIZADA ═══" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "✅ Análise concluída! Dados salvos em: $OUTPUT"
echo ""
cat "$OUTPUT"
