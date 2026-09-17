# Análise do Código Atual vs. Proposta BusAcessível

## Estado Atual do Projeto
O projeto encontra-se em uma fase inicial (boilerplate), utilizando as seguintes tecnologias:
- **Backend**: Node.js com Fastify e TypeScript.
- **Banco de Dados**: PostgreSQL com Prisma ORM.
- **Frontend**: Next.js (App Router).

### Pontos de Divergência
1. **Autenticação**: O sistema atual utiliza um modelo tradicional de `Email/Senha` na tabela `User`. A proposta exige um fluxo sem senha (**Device Binding + OTP**), removendo a fricção de login para usuários com deficiência visual.
2. **Modelo de Dados**:
   - Atualmente existe apenas `User` e `Chamado`.
   - A proposta exige tabelas específicas para `Passageiros`, `Pontos de Ônibus`, `Veículos/Linhas` e `Solicitações de Embarque` com campos de geolocalização (`latitude`, `longitude`).
3. **Funcionalidades**:
   - O backend atual possui apenas rotas básicas de CRUD para chamados.
   - Faltam rotas para consulta de pontos próximos, validação de OTP e o sistema de alertas para o motorista baseado em proximidade geográfica.

## Melhorias Necessárias para o MVP
1. **Migração para NestJS (Opcional, mas recomendado)**: Para maior escalabilidade e organização seguindo padrões de mercado, embora o Fastify atual seja funcional.
2. **Refatoração do Prisma Schema**: Implementar o modelo relacional de 4 tabelas proposto.
3. **Implementação de Device Binding**: Lógica para vincular o `device_id` ao telefone do passageiro.
4. **Integração Geográfica**: Uso de consultas espaciais (ou lógica no backend) para identificar pontos num raio de X metros.
5. **Sistema de Notificação em Tempo Real**: Uso de WebSockets ou Polling eficiente para avisar o motorista e o passageiro sobre a aproximação.
