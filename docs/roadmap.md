# Roadmap de Implementação

Passo a passo para levar o BusAcessível do estado atual para o MVP funcional.

## Fase 1: Fundação do Backend (Semana 1)
- [ ] Refatorar/Atualizar Prisma Schema com as novas tabelas.
- [ ] Implementar lógica de Autenticação (SMS Fake para testes / Integração com Provider).
- [ ] Criar CRUD de Pontos e Linhas (Dados estáticos iniciais).

 ## Fase 2: Inteligência Geográfica (Semana 2) 
- [ ] Implementar busca de pontos por raio de distância.
- [ ] Criar lógica de vinculação da Solicitação de Embarque.
- [ ] Desenvolver o endpoint de Alertas do Motorista (Filtro por linha + proximidade).

## Fase 3: Frontend Passageiro (Semana 3)
- [ ] Criar tela de Onboarding (SMS).
- [ ] Implementar tela de seleção de Ponto/Linha com foco em acessibilidade.
- [ ] Adicionar feedback tátil (vibration API) para status de embarque.

## Fase 4: Painel do Motorista (Semana 4)
- [ ] Visualização simples de solicitações ativas.
- [ ] Alerta sonoro automático ao se aproximar de um ponto com passageiro aguardando.
