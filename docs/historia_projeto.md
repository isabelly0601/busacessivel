# 🧠 Memória do Projeto: BusAcessível
> Última atualização: 07/04/2026 às 09:25

Este documento serve como a "memória consciente" do projeto, capturando todas as decisões estratégicas, implementações realizadas e o estado atual do sistema.

---

## 📅 Cronologia das Decisões

### 20/03/2026 — Início do Projeto
- Primeiro commit no GitHub.
- Stack inicial: Next.js + Fastify + PostgreSQL + Prisma + Docker.

### 24/03 a 06/04/2026 — Desenvolvimento do MVP
- Implementação de Vertical Slice Architecture no backend.
- Nested Routing no frontend (admin, motorista, passageiro).
- Dockerização completa (database, backend, frontend, nginx).
- Avaliação técnica atingiu 91.8%.

### 07/04/2026 — Sessão de Refatoração Avançada
Sessão intensiva onde todas as pendências foram resolvidas e novos requisitos do professor foram implementados.

---

## 🏗️ Fase 1: Infraestrutura MinIO (✅ CONCLUÍDA)

### Decisão Arquitetural
- **Problema**: Onde armazenar laudos médicos e imagens de perfil?
- **Opções avaliadas**: PostgreSQL BLOB vs MongoDB vs Object Storage
- **Decisão final**: **MinIO (Object Storage S3-compatível)** em contêiner Docker dedicado.
- **Motivo**: Performance, conformidade LGPD via Presigned URLs, e migração trivial para AWS S3 no futuro.

### Arquivos Modificados
| Arquivo | Mudança |
| :--- | :--- |
| `docker-compose.yml` | Serviços `minio` (porta 9000/9001) e `mc` (provisiona bucket) |
| `.env` | `MINIO_ROOT_USER=minioadmin`, `MINIO_ROOT_PASSWORD=minioadmin` |
| `backend/package.json` | Dependência `minio` SDK |
| `backend/src/services/storage.service.ts` | Funções `uploadFile`, `getPresignedUrl`, `deleteFile` |

### Console MinIO
- Acesso via: `http://localhost:9001`
- Bucket automático: `laudos-pcd`

---

## 🔌 Migração para Driver Nativo PostgreSQL (✅ CONCLUÍDA)

### Decisão Arquitetural
- **Antes**: PrismaClient → Prisma Engine (binário Rust) → PostgreSQL
- **Depois**: PrismaClient → `pg` Pool (Node.js nativo) → PostgreSQL direto
- **Motivo**: Melhor performance, elimina `binaryTargets`, e habilita suporte futuro a PostGIS.

### Arquivos Modificados
| Arquivo | Mudança |
| :--- | :--- |
| `backend/package.json` | Adicionados `pg` e `@prisma/adapter-pg` |
| `backend/prisma/schema.prisma` | `previewFeatures = ["driverAdapters"]`, removido `binaryTargets` |
| `backend/src/lib/prisma.ts` | Usa `Pool` (pg) → `PrismaPg` (adapter) → `PrismaClient` |

---

## 🗄️ Fase 2: Banco de Dados Expandido (✅ CONCLUÍDA)

### Novos Enums
| Enum | Valores |
| :--- | :--- |
| `Role` | PASSAGEIRO, MOTORISTA, FISCAL, EMPRESA, ADMIN |
| `StatusConta` | PENDENTE, ATIVO, SUSPENSO, REJEITADO |
| `TipoVeiculo` | ONIBUS, METRO, BRT |
| `StatusSolicitacao` | AGUARDANDO, NOTIFICADO, EMBARCADO, CANCELADO, CONCLUIDO |

### Novos Modelos
| Modelo | Objetivo |
| :--- | :--- |
| `Fiscal` | Perfil de fiscal com matrícula e órgão fiscalizador |
| `ValidacaoPCD` | Upload de laudo médico, aprovação/rejeição por admin |
| `AlertaNaoAtendido` | Log de motoristas que ignoram alertas PCD |

### Campos Adicionados em Modelos Existentes
| Modelo | Campo | Tipo |
| :--- | :--- | :--- |
| `User` | `cpf` | String (Unique, 11 dígitos) |
| `User` | `statusConta` | StatusConta (Default: PENDENTE) |
| `Linha` | `tipoVeiculo` | TipoVeiculo (Default: ONIBUS) |
| `SolicitacaoEmbarque` | `linhaId` | FK → Linha.id |
| `SolicitacaoEmbarque` | `distanciaMotoristaNotif` | Decimal(10,2) metros |
| `AuditLog` | `userId` | Agora é FK real → User.id |

### Middleware RBAC
- Arquivo: `backend/src/middlewares/authorize.ts`
- Funcionalidade: Verifica role do usuário E status da conta antes de permitir acesso.
- Uso: `{ preHandler: authorize('ADMIN') }`

### Mapa de Permissões
| Funcionalidade | PASSAGEIRO | MOTORISTA | FISCAL | EMPRESA | ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Solicitar Embarque | ✅ | ❌ | ❌ | ❌ | ✅ |
| Validar QR Code | ❌ | ✅ | ❌ | ❌ | ✅ |
| Enviar Laudo PCD | ✅ | ❌ | ❌ | ❌ | ❌ |
| Aprovar/Rejeitar Laudo | ❌ | ❌ | ❌ | ❌ | ✅ |
| Registrar Alerta Ignorado | ❌ | ❌ | ✅ | ❌ | ✅ |
| Relatório de Alertas | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gerenciar Frota/Linhas | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gerenciar Usuários | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔜 Fase 3: Regras de Negócio (PENDENTE)

### A Implementar
1. **Geofencing de 50m**: Validar distância entre passageiro e ponto usando fórmula Haversine.
2. **Trava de Conta**: Bloquear embarque se `statusConta !== ATIVO`.
3. **Upload de Laudos**: Feature `validation.feature.ts` integrada ao MinIO.
4. **Aplicar middleware `authorize()`** em todas as rotas existentes.

## 🔜 Fase 4: Frontend e Acessibilidade (PENDENTE)

### A Implementar
1. **Aria-Live Regions**: Anúncios automáticos de mudança de status para leitores de tela.
2. **Formulário PCD**: Upload de documentos e acompanhamento da validação.
3. **Conformidade WCAG**: Contraste mínimo 4.5:1, escala de fonte acessível.

---

## 🔧 Stack Tecnológica Final

### Backend
| Tecnologia | Versão | Status |
| :--- | :--- | :--- |
| Fastify | 5.0.0 | ✅ |
| TypeScript | 5.x | ✅ |
| Prisma (Driver Nativo) | 7.4.0 | ✅ |
| pg (node-postgres) | 8.16.0 | ✅ |
| MinIO SDK | 8.0.5 | ✅ |
| Vitest | 4.1.2 | ✅ |
| PDFKit | 0.18.0 | ✅ |
| @fastify/multipart | 9.4.0 | ✅ |

### Frontend
| Tecnologia | Versão | Status |
| :--- | :--- | :--- |
| Next.js | 16.1.6 | ✅ |
| React | 19.2.3 | ✅ |
| Tailwind CSS | 4.0.0 | ✅ |
| TipTap | 3.22.2 | ✅ |
| qrcode.react | 4.2.0 | ✅ |
| JsBarcode | 3.12.3 | ✅ |
| XLSX | 0.18.5 | ✅ |

### Infraestrutura
| Serviço | Imagem Docker | Status |
| :--- | :--- | :--- |
| PostgreSQL | bitnami/postgresql:latest | ✅ |
| MinIO | bitnami/minio:latest | ✅ |
| Nginx | nginx:latest | ✅ |
| Certbot | certbot/certbot:latest | ✅ |

---

*Este documento deve ser consultado no início de cada sessão para garantir continuidade do trabalho.*
