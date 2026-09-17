# 🗺️ Planejamento de Execução: Agente de Transformação

Este documento foi projetado para atuar como o guia mestre de execução das etapas de evolução do BusAcessível. Cada seção abaixo representa uma fase crítica que deve ser executada e verificada sistematicamente.

## User Review Required

> [!IMPORTANT]
> A implementação requer o desligamento momentâneo dos contêineres para reconfigurar o `docker-compose.yml`.
> A migração do banco de dados (`npx prisma migrate dev`) será necessária.

## Proposed Changes

### 🟢 Fase 1: Infraestrutura e Armazenamento (MinIO)
Integrar o serviço de armazenamento de objetos para lidar com laudos e imagens médicas.
- **[MODIFY] [docker-compose.yml](file:///c:/Users/Dev2/Documents/projetos/busacessivel/docker-compose.yml)**: Adicionar serviços `minio` e `mc`.
- **[NEW] [storage.service.ts](file:///c:/Users/Dev2/Documents/projetos/busacessivel/backend/src/services/storage.service.ts)**: Criar service para comunicação com o bucket S3 local.

### 🟡 Fase 2: Expansão do Modelo de Dados (PostgreSQL + Prisma)
Refatorar o esquema para suportar segurança avançada e auditoria.
- **[MODIFY] [schema.prisma](file:///c:/Users/Dev2/Documents/projetos/busacessivel/backend/prisma/schema.prisma)**: Inclusão de CPF, Status de Conta, Validação PCD e Tabela de Auditoria.

### 🔴 Fase 3: Regras de Negócio e Geofencing
Implementar a lógica que impede fraudes e garante o uso correto do sistema.
- **[MODIFY] [boarding.feature.ts](file:///c:/Users/Dev2/Documents/projetos/busacessivel/backend/src/features/boarding/boarding.feature.ts)**: Implementação do raio de 50 metros e validação de `status_conta === ATIVO`.
- **[NEW] [validation.feature.ts](file:///c:/Users/Dev2/Documents/projetos/busacessivel/backend/src/features/validation/validation.feature.ts)**: Fluxo de upload e revisão administrativa.

### 🔵 Fase 4: Frontend e Acessibilidade (WCAG)
Interface transparente e adaptada para deficientes visuais.
- **[MODIFY] [BoardingStatus.tsx](file:///c:/Users/Dev2/Documents/projetos/busacessivel/frontend/app/passageiro/components/BoardingStatus.tsx)**: Adicionar `aria-live="polite"` para feedback em tempo real.

## Open Questions

- Deseja que eu inicie a implementação pela Fase 1 (Docker/MinIO) agora mesmo?

## Verification Plan

### Automated Tests
- Criar testes de integração para o Geofencing.
- Validar persistência de laudos no MinIO via API.

---
*Este plano será atualizado conforme avançamos na conclusão de cada fase.*
