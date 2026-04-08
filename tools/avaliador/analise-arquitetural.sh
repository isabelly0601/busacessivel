#!/bin/bash
# tools/avaliador/analise-arquitetural.sh
# Script para coleta de métricas arquiteturais do projeto

echo "=== 3.1 Classificação Arquitetural do Frontend ==="
echo "Arquivos grandes (>500 linhas):"
find frontend -name "*.tsx" -exec wc -l {} + 2>/dev/null | sort -rn | head -15 || true
echo ""
echo "Dynamic imports / Lazy loading:"
grep -rn "dynamic(" frontend/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -10 || true
grep -rn "React.lazy\|lazy(" frontend/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -10 || true
grep -rn "Suspense" frontend/ --include="*.tsx" 2>/dev/null | head -10 || true
echo ""
echo "Componentes por diretório:"
find frontend/app -type f -name "*.tsx" 2>/dev/null | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn || true
echo ""

echo "=== 3.2 Extração de Componentes ==="
echo "Subcomponentes importados entre si (contagem):"
grep -rn "import.*from.*'\./\|import.*from.*'\.\./" frontend/ --include="*.tsx" 2>/dev/null | wc -l || true
echo ""

echo "=== 3.3 Roteamento Aninhado Nativo (Nested Routing) ==="
echo "Estrutura de rotas aninhadas - profundidade máxima:"
find frontend/app -name "page.tsx" 2>/dev/null | awk -F/ '{print NF-1, $0}' | sort -rn | head -5 || true
echo ""

echo "=== 3.4 Vertical Slice no Backend ==="
echo "Estrutura do backend (diretórios raiz):"
find backend/src -mindepth 1 -maxdepth 1 -type d | sort || true
echo "Tamanho do server.ts:"
wc -l backend/src/server.ts 2>/dev/null || true
echo ""

echo "=== 3.5 Banco de Dados ==="
echo "Modelos no Prisma schema API:"
grep -c "^model " backend/prisma/schema.prisma 2>/dev/null || echo "0"
echo "Atributos totais no Prisma schema API:"
grep -E "^\s+\w+\s+(String|Int|Float|Boolean|DateTime|Decimal|BigInt|Json|Bytes)" backend/prisma/schema.prisma 2>/dev/null | wc -l || true
echo "Configuração do BD no Docker (trecho):"
grep -A5 "POSTGRESQL\|postgres\|DATABASE_URL" docker-compose.yml 2>/dev/null || true
echo ""

echo "=== 3.6 Formulários e Comunicação com o Banco de Dados ==="
echo "Formulários no frontend (contagem):"
grep -rn "onSubmit\|handleSubmit\|<form" frontend/ --include="*.tsx" 2>/dev/null | wc -l || true
echo "Chamadas fetch/POST/PUT/DELETE/PATCH (contagem):"
grep -rn "fetch(\|POST\|PUT\|DELETE\|PATCH" frontend/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || true
echo "Rotas de create/insert no backend (contagem):"
grep -rn "create(\|createMany(\|insert" backend/src/ --include="*.ts" 2>/dev/null | wc -l || true
echo ""

echo "=== 3.7 Sistema de Roles e Permissões ==="
echo "Modelos de Role/Perfil no Schema:"
grep -n "model.*Perfil\|model.*Role\|model.*Permiss\|model.*Usuario\|model.*Admin" backend/prisma/schema.prisma 2>/dev/null || true
echo "Middleware/Guards no backend (contagem):"
grep -rn "role\|perfil\|admin\|permission\|authorize\|isAdmin\|isAuth" backend/src/ --include="*.ts" 2>/dev/null | wc -l || true
echo ""

echo "=== 3.8 Verificações Complementares ==="
echo "Docker services:"
grep -A1 "services:" docker-compose.yml 2>/dev/null || true