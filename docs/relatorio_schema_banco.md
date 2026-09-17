# 🗄️ Relatório do Agente Avaliador de Schema — BusAcessível
> Gerado automaticamente em 07/04/2026 às 09:19
> Fonte: `backend/prisma/schema.prisma`

---

## 📊 Visão Geral

| Métrica | Valor |
| :--- | :--- |
| **Provider** | PostgreSQL |
| **Driver** | Nativo (`pg` via `@prisma/adapter-pg`) |
| **Preview Features** | `driverAdapters` |
| **Total de Modelos** | 8 |
| **Total de Enums** | 1 |
| **Total de Atributos** | 52 |
| **Total de Relacionamentos** | 10 |

---

## 🔑 Enums

### `Role`
| Valor | Descrição |
| :--- | :--- |
| `PASSAGEIRO` | Usuário final com deficiência |
| `MOTORISTA` | Condutor de ônibus |
| `EMPRESA` | Empresa de transporte |
| `ADMIN` | Administrador do sistema |

> ⚠️ **PENDÊNCIA**: Falta o role `FISCAL` conforme requisitos do professor.

---

## 📋 Tabelas (Modelos)

### 1. `User` — Tabela Central de Usuários
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK, auto-gerado | ✅ |
| `email` | String? | Unique | Opcional |
| `telefone` | String? | Unique | Opcional |
| `passwordHash` | String? | — | Hash da senha |
| `nome` | String | Obrigatório | — |
| `role` | Role (Enum) | Default: PASSAGEIRO | — |
| `status` | String | Default: "ativo" | ativo, banido, em_analise |
| `avatarUrl` | String? | — | URL da foto |
| `criadoEm` | DateTime | Default: now() | — |

**Relacionamentos (1:1):**
- `User` → `Passageiro`
- `User` → `Motorista`
- `User` → `Empresa`

> ⚠️ **PENDÊNCIA**: Falta campo `cpf` (VARCHAR, Unique). Falta enum `StatusConta` (PENDENTE, ATIVO, SUSPENSO, REJEITADO) — atualmente `status` é String livre.

---

### 2. `Passageiro` — Perfil do Passageiro PCD
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | — |
| `userId` | String | FK → User.id, Unique | Relação 1:1 |
| `deviceId` | String? | Unique | ID do dispositivo |
| `preferenciasAcess` | String? | — | Preferências de acessibilidade |

**Relacionamentos:**
- `Passageiro` ←→ `User` (1:1)
- `Passageiro` → `SolicitacaoEmbarque[]` (1:N)

> ✅ Estrutura adequada.

---

### 3. `Motorista` — Perfil do Motorista
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | — |
| `userId` | String | FK → User.id, Unique | Relação 1:1 |
| `cnh` | String? | — | Número da CNH |
| `veiculoAtualId` | String? | FK → Onibus.id | Ônibus atual |

**Relacionamentos:**
- `Motorista` ←→ `User` (1:1)
- `Motorista` → `Onibus` (N:1)  
- `Motorista` → `SolicitacaoEmbarque[]` via relação "Validador" (1:N)

> ✅ Estrutura adequada.

---

### 4. `Empresa` — Empresa de Transporte
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | — |
| `userId` | String | FK → User.id, Unique | Relação 1:1 |
| `cnpj` | String | Unique | CNPJ da empresa |
| `razaoSocial` | String | Obrigatório | Nome da empresa |

**Relacionamentos:**
- `Empresa` ←→ `User` (1:1)
- `Empresa` → `Linha[]` (1:N)

> ✅ Estrutura adequada.

---

### 5. `Linha` — Linha de Transporte
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | — |
| `codigo` | String | Unique | Ex: "403-A" |
| `nome` | String? | — | Ex: "Santa Tereza / Centro" |
| `metropolitana` | Boolean | Default: false | — |
| `empresaId` | String? | FK → Empresa.id | — |

**Relacionamentos:**
- `Linha` → `Empresa` (N:1)
- `Linha` → `Onibus[]` (1:N)

> ⚠️ **PENDÊNCIA**: Falta campo `tipo_veiculo` (ENUM: onibus, metro, brt).

---

### 6. `Onibus` — Veículo
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | — |
| `placa` | String? | Unique | — |
| `prefixo` | String? | — | Número do ônibus |
| `linhaId` | String | FK → Linha.id | Obrigatório |

**Relacionamentos:**
- `Onibus` → `Linha` (N:1)
- `Onibus` → `Motorista[]` (1:N)

> ✅ Estrutura adequada.

---

### 7. `PontoOnibus` — Ponto de Parada
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | — |
| `externalId` | String? | Unique | ID externo BHTrans |
| `nomeDescricao` | String | Obrigatório | — |
| `latitude` | Decimal(10,8) | — | Coordenada |
| `longitude` | Decimal(10,8) | — | Coordenada |

**Relacionamentos:**
- `PontoOnibus` → `SolicitacaoEmbarque[]` (1:N)

> ⚠️ **NOTA**: Futuramente usar tipo `POINT` (PostGIS) para cálculos geoespaciais nativos.

---

### 8. `SolicitacaoEmbarque` — Solicitação de Viagem
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | — |
| `passageiroId` | String | FK → Passageiro.id | — |
| `pontoId` | String | FK → PontoOnibus.id | — |
| `codigoLinhaDesejada` | String | — | Código da linha |
| `latitudePassageiro` | Decimal(10,8) | — | Posição GPS |
| `longitudePassageiro` | Decimal(10,8) | — | Posição GPS |
| `status` | String | Default: "aguardando" | aguardando, notificado, embarcado, cancelado |
| `qrCodeHash` | String? | — | Hash de segurança |
| `validadoEm` | DateTime? | — | Quando o motorista confirmou |
| `motoristaId` | String? | FK → Motorista.id | Validador |
| `criadoEm` | DateTime | Default: now() | — |
| `atualizadoEm` | DateTime | @updatedAt | — |

**Relacionamentos:**
- `SolicitacaoEmbarque` → `Passageiro` (N:1)
- `SolicitacaoEmbarque` → `PontoOnibus` (N:1)
- `SolicitacaoEmbarque` → `Motorista` via "Validador" (N:1)

> ⚠️ **PENDÊNCIA**: Falta `linha_id` (FK → Linha.id) e `distancia_motorista_notificacao` (Decimal).

---

### 9. `AuditLog` — Log de Auditoria
| Atributo | Tipo | Constraints | Observação |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | PK | — |
| `userId` | String? | — | ⚠️ Sem FK definida |
| `acao` | String | — | — |
| `detalhes` | String? | — | — |
| `ipAddress` | String? | — | — |
| `userAgent` | String? | — | — |
| `criadoEm` | DateTime | Default: now() | — |

> ⚠️ **PENDÊNCIA**: `userId` deveria ser FK → User.id para integridade referencial.

---

## 🔗 Mapa de Relacionamentos

```
User (1) ──── (1) Passageiro ──── (N) SolicitacaoEmbarque
  │                                        │
  ├── (1) Motorista ──── (N) Onibus        ├── (1) PontoOnibus
  │        │                  │            │
  │        └──── Validador ───┘            └── (1) Motorista (Validador)
  │
  └── (1) Empresa ──── (N) Linha ──── (N) Onibus
```

---

## ❌ Tabelas que FALTAM (Conforme Requisitos do Professor)

| Tabela | Objetivo | Status |
| :--- | :--- | :--- |
| `ValidacaoPCD` | Upload de laudo médico, aprovação por admin | 🔴 Não existe |
| `AlertaNaoAtendido` | Log de motoristas que ignoram PCDs | 🔴 Não existe |

---

## 📝 Resumo de Pendências para a Fase 2

1. **Adicionar `cpf`** (Unique) ao model `User`.
2. **Criar enum `StatusConta`** (PENDENTE, ATIVO, SUSPENSO, REJEITADO) e substituir o campo `status` (String livre).
3. **Adicionar `FISCAL`** ao enum `Role`.
4. **Criar model `ValidacaoPCD`** com `url_laudo`, `numero_cartao_especial`, `validado_por`, `motivo_rejeicao`.
5. **Criar model `AlertaNaoAtendido`** com referência ao motorista e à solicitação ignorada.
6. **Adicionar `tipo_veiculo`** (enum) ao model `Linha`.
7. **Adicionar `linha_id`** (FK) e `distancia_motorista_notificacao` ao model `SolicitacaoEmbarque`.
8. **Transformar `AuditLog.userId`** em FK real para `User.id`.

> Este relatório será a base para a Fase 2 da implementação.
