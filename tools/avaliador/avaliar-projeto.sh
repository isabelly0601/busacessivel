#!/bin/bash
# 🎓 AGENTE AVALIADOR DE PROJETO ACADÊMICO — Scanner Automatizado
set -e

# Detectar raiz do projeto
PROJECT_ROOT="$(pwd)"
OUTPUT="$PROJECT_ROOT/evaluation_data.txt"

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

# 1. ANÁLISE DO FRONTEND (frontend)
echo "═══ FRONTEND (frontend) ═══" >> "$OUTPUT"

WEB_PKG="$PROJECT_ROOT/frontend/package.json"
if [ -f "$WEB_PKG" ]; then
    echo "✅ package.json encontrado" >> "$OUTPUT"
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
    
    check_dep "$WEB_PKG" "next" "Next.js"
    check_dep "$WEB_PKG" "react\"" "React"
    check_dep "$WEB_PKG" "react-dom" "React DOM"
    check_dep "$WEB_PKG" "typescript" "TypeScript"
    check_dep "$WEB_PKG" "tailwindcss" "TailwindCSS"
    check_dep "$WEB_PKG" "lucide-react" "Lucide React"
    check_dep "$WEB_PKG" "@prisma/client" "Prisma Client"
    
    echo "" >> "$OUTPUT"
    echo "-- Dependências NÃO mapeadas --" >> "$OUTPUT"
    KNOWN_DEPS="next|react|react-dom|typescript|tailwindcss|lucide-react|@prisma|clsx|tailwind-merge|xlsx|jsbarcode|qrcode.react|eslint|@tailwindcss|prisma|ts-node|@types"
    grep '"@\|"[a-z]' "$WEB_PKG" | grep -v "name\|version\|private\|scripts\|main\|license\|author\|description\|keywords\|seed\|prisma" | grep -vE "$KNOWN_DEPS" | while read -r line; do
        dep_name=$(echo "$line" | sed 's/.*"\([^"]*\)".*/\1/' | head -1)
        if [ -n "$dep_name" ] && [ "$dep_name" != "{" ] && [ "$dep_name" != "}" ]; then
            echo "  ⚠️  EXTRA: $dep_name" >> "$OUTPUT"
        fi
    done
else
    echo "❌ package.json NÃO encontrado em frontend/" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# 2. ANÁLISE DO BACKEND (backend)
echo "═══ BACKEND (backend) ═══" >> "$OUTPUT"

API_PKG="$PROJECT_ROOT/backend/package.json"
if [ -f "$API_PKG" ]; then
    echo "✅ package.json encontrado" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "-- Dependências de Produção --" >> "$OUTPUT"
    check_dep "$API_PKG" "fastify\"" "Fastify"
    check_dep "$API_PKG" "typescript" "TypeScript"
    check_dep "$API_PKG" "@prisma/client" "Prisma Client"
    check_dep "$API_PKG" "zod" "Zod"
    check_dep "$API_PKG" "bcryptjs" "bcryptjs"
    check_dep "$API_PKG" "pg\"" "pg (node-postgres)"
else
    echo "❌ package.json NÃO encontrado em backend/" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# 3. INFRAESTRUTURA
echo "═══ INFRAESTRUTURA ═══" >> "$OUTPUT"
if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    echo "✅ docker-compose.yml encontrado" >> "$OUTPUT"
fi

# 4. ARQUITETURA
echo "═══ ARQUITETURA ═══" >> "$OUTPUT"
echo "-- Estrutura Frontend --" >> "$OUTPUT"
if [ -d "$PROJECT_ROOT/frontend/app" ]; then
    ROUTES=$(find "$PROJECT_ROOT/frontend/app" -name "page.tsx" -o -name "page.ts" 2>/dev/null | wc -l | tr -d ' ')
    echo "  📁 Rotas (pages): $ROUTES" >> "$OUTPUT"
fi

echo "-- Estrutura Backend --" >> "$OUTPUT"
if [ -d "$PROJECT_ROOT/backend/src" ]; then
    if [ -d "$PROJECT_ROOT/backend/src/features" ] || [ -d "$PROJECT_ROOT/backend/src/modules" ]; then
        echo "  ✅ Padrão Vertical Slice / Modular DETECTADO" >> "$OUTPUT"
    fi
fi

# 5. PRISMA
echo "-- ORM Prisma --" >> "$OUTPUT"
if [ -f "$PROJECT_ROOT/backend/prisma/schema.prisma" ]; then
    MODELS=$(grep "^model " "$PROJECT_ROOT/backend/prisma/schema.prisma" | wc -l | tr -d ' ')
    echo "  ✅ backend/prisma/schema.prisma ($MODELS modelos)" >> "$OUTPUT"
    grep "^model " "$PROJECT_ROOT/backend/prisma/schema.prisma" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "═══ FIM DA ANÁLISE AUTOMATIZADA ═══" >> "$OUTPUT"