# 🚍 BusAcessível / PontoMB

O **BusAcessível** (também conhecido como **PontoMB**) é uma solução tecnológica inovadora projetada para garantir autonomia e segurança no transporte público para pessoas com deficiência visual.

## 🌟 Visão Geral
O projeto resolve o problema da falta de informações sonoras em tempo real nos pontos de ônibus. Através de geolocalização precisa e interfaces de áudio, o passageiro recebe alertas sobre a proximidade dos veículos e pode solicitar embarques via comandos de voz.

## 🚀 Funcionalidades Principais
- **Localização em Tempo Real**: Mapeamento de pontos próximos via GPS.
- **Biper de Proximidade**: Sinais sonoros rítmicos que indicam a distância do ponto e a chegada do ônibus.
- **Comandos de Voz**: Interface "Voice-First" para busca de linhas e solicitações.
- **Painel do Motorista**: Notificações instantâneas sobre passageiros PCD aguardando no próximo ponto.
- **Gestão de Laudos**: Sistema integrado com MinIO para validação de documentos PCD.

## 🛠️ Stack Tecnológica
- **Frontend**: Next.js 16 (React 19), Tailwind CSS 4.
- **Backend**: Fastify 5 (Node.js).
- **Banco de Dados**: PostgreSQL 17 com Prisma ORM 7.
- **Storage**: MinIO (Object Storage S3-compatível).
- **Infraestrutura**: Docker & Docker Compose com Proxy Reverso Nginx.

## 📦 Como Executar
Basta ter o Docker instalado e rodar na raiz do projeto:
```bash
docker compose up -d
```
A aplicação estará disponível em `http://localhost`.

## 👥 Contribuidores
Este projeto é desenvolvido com a colaboração de:

- **Eder Fonseca** ([@eder017](https://github.com/eder017))
- **Matheus** ([@mathuesssssssssss](https://github.com/mathuesssssssssss))
- **Ketlyn** ([@Ketlyn-204](https://github.com/Ketlyn-204))

---
*BusAcessível - Transformando o transporte público em um ambiente para todos.*