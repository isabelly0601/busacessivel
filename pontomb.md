# Projeto: PontoMB (Especificação do MVP)
*Documento gerado a partir do alinhamento sobre o aplicativo de acessibilidade em ônibus coletivos.*

## 1. Visão Geral (O Problema)
Pessoas com deficiência visual muitas vezes são prejudicadas no embarque de rotas de ônibus públicos por não obterem informações sonoras adequadas sobre qual ônibus está chegando ou se estão no ponto correto. A depender de ajuda de terceiros tira a autonomia do passageiro.

A aplicação **PontoMB** atua resolvendo esse problema, com alta capacidade comunicativa nativa.

## 2. Arquitetura do MVP (Minimum Viable Product)

### 2.1. Funcionalidades do Passageiro (App Mobile-First)
- **Localização de Pontos Próximos**: O app mapeia o GPS em tempo real e informa via áudio quais paradas estão por perto.
- **Biper de Ponto (Som 1)**: Quando o passageiro estiver posicionado próximo ao ponto de parada, o aplicativo emite um tipo de som específico (como um radar rítmico), confirmando que ele está no local certo.
- **Comando de Voz Interativo**: O passageiro não precisa enxergar botões pequenos. Ele aciona o app e simplesmente _fala_ qual o ônibus deseja pegar (ex: *"Quero a linha Centro"*). O app transcreve a fala e despacha a requisição.
- **Biper do Ônibus (Som 2)**: Quando o motorista (da linha solicitada) estiver fisicamente chegando perto da parada, o app troca o áudio e emite _outro_ tipo de som, indicando que o embarque é iminente.

### 2.2. Funcionalidades do Motorista (Dashboard)
- O motorista daquela linha específica recebe instantaneamente o comando que o passageiro enviou (via voz), e tem total consciência de que precisará facilitar o embarque no ponto "X".
- Pode acusar o recebimento via botão de alto contraste no painel.

## 3. Tecnologia Utilizada
- **Linguagem Base**: TypeScript em toda a aplicação.
- **Ecossistema Web**: Next.js v16 (React v19) focado em front-end acessível e TailwindCSS v4.
- **Back-end e Banco**: Fastify v5 com rotas ágeis conectadas num banco de dados PostgreSQL manipulado via Prisma ORM Dockerizado.

## 4. Status das Etapas
- **[Concluído] Etapa 0: A Fundação**. O ambiente completo (frontend, servidor Fastify e o Banco de dados relacional) já foi configurado dentro de Containers do Docker (onde agora é formalmente nomeado `busacessivel`/`pontomb`). O sistema está de pé e as requisições API funcionam.
- **[A Fazer] Etapa 1: Voz e Identidade Visual**. O próximo passo de programação. Consiste em reconstruir a interface para ser esteticamente premium, acoplando a "Web Speech API" para escutar os comandos do passageiro e processá-los como requisições de transporte.
- **[A Fazer] Etapa 2: Motor GPS Espacial**. Focar nas funções rítmicas sonoras, monitorando a distância via `navigator.geolocation` para tocar o Som 1 (perto do ponto) e disparar o webhook pro Som 2 (ônibus chegando).
