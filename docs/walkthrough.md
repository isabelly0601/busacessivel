# Walkthrough: Provisionamento e Refatoração BusAcessível

Este documento resume as entregas realizadas para a infraestrutura e arquitetura do projeto BusAcessível.

## 1. Provisionamento de Infraestrutura (Docker)

O ambiente foi totalmente dockerizado, permitindo que o projeto rode em qualquer máquina com um único comando.

- **PostgreSQL**: Provisionado com Bitnami, incluindo healthchecks para garantir que o backend aguarde o banco estar pronto.
- **Backend (Fastify + Prisma)**: Configurado para realizar o `prisma generate`, `prisma db push` (sincronização do esquema) e `prisma db seed` automaticamente ao iniciar.
- **Frontend (Next.js)**: Rodando em modo desenvolvimento com Turbopack.

> [!IMPORTANT]
> Se notar erros de "Module not found" no backend, execute: `docker-compose up --build` para garantir que todas as dependências do `package.json` sejam instaladas na imagem.

## 2. Refatoração Modular do Frontend

Aplicamos dois níveis de refatoração para garantir escalabilidade e performance:

### Estratégia A: Roteamento Aninhado (Admin)
O Painel Administrativo agora usa as rotas físicas do Next.js para gerenciar abas. Isso permite "Lazy Loading" nativo e URLs compartilháveis para cada aba.
- **/admin/dashboard**: Visão geral do sistema.
- **/admin/frota**: Gerenciamento de veículos.
- **/admin/pontos**: Edição de coordenadas geográficas.

### Estratégia B: Extração de Componentes (Passageiro e Motorista)
Os fluxos de usuário, que antes eram arquivos monolíticos de 300+ linhas, foram quebrados em componentes lógicos:
- **Motorista**: Separado em `RouteSetup`, `MotoristaDashboard` e `AlertCard`.
- **Passageiro**: Separado em `AuthFlow`, `StopSelection`, `LineSelection` e `BoardingStatus`.

## 4. Repositório Remoto

O código agora está sincronizado com o GitHub:
- **Repositório**: [isabelly0601/busacessivel](https://github.com/isabelly0601/busacessivel)

Para clonar e rodar o projeto do zero:
```bash
git clone https://github.com/isabelly0601/busacessivel.git
cd busacessivel
docker-compose up -d --build
```

```bash
docker-compose up -d --build
```
- **Passageiro**: `http://localhost:3000/passageiro`
- **Motorista**: `http://localhost:3000/motorista`
- **Admin**: `http://localhost:3000/admin`
- **API Backend**: `http://localhost:3001`

Abaixo, a nova estrutura de arquivos:
```text
frontend/app/
├── admin/ (Nested Routing)
│   ├── dashboard/
│   ├── frota/
│   └── pontos/
├── motorista/ (Modular Components)
│   └── components/
└── passageiro/ (Modular Components)
    └── components/
```
