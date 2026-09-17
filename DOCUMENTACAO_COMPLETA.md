# 🚍 BusAcessível / PontoMB - Documentação Completa

## 📖 Sobre o Projeto
O **BusAcessível** (ou **PontoMB**) é um aplicativo inovador voltado para a **inclusão e acessibilidade** no transporte público. O foco principal é proporcionar autonomia e segurança para **pessoas com deficiência visual**, resolvendo a dificuldade de saber qual ônibus está se aproximando, quando dar o sinal e como encontrar o ponto de ônibus.

O projeto utiliza uma abordagem **Voice-First** (focada em voz) e geolocalização de alta precisão para criar um ambiente onde o passageiro é guiado passo a passo até o seu destino.

---

## 🎯 Como Funciona o Aplicativo?

### Para o Passageiro (Foco em Acessibilidade)
1. **Interface Adaptada**: 
   - A tela inicial possui alto contraste (cores vibrantes como o amarelo `#FFCC00` e preto), botões grandes e leitura em voz alta.
   - Navegação por toques simples, otimizada para leitores de tela e feedbacks sonoros.
2. **Navegação e GPS**:
   - O aplicativo localiza o passageiro e fornece orientações por áudio para chegar ao ponto de ônibus mais próximo.
3. **Biper de Proximidade e Alertas**:
   - Um sistema sonoro indica a distância do ponto de ônibus.
   - Quando o ônibus se aproxima, o aplicativo fala: *"Linha 302, sentido Centro, chegando em 3 minutos."*
4. **Solicitação de Parada**:
   - O passageiro pode confirmar que deseja embarcar através do aplicativo, enviando um alerta direto para o motorista do ônibus.

### Para o Motorista
1. **Painel de Controle**:
   - O motorista visualiza em seu painel que há um passageiro aguardando no próximo ponto, com aviso de acessibilidade.
   - Isso evita que o motorista passe direto por um ponto onde um deficiente visual esteja aguardando sem conseguir fazer o sinal de parada com as mãos.

---

## 🚀 Como Nós Fizemos (Evolução e Avanços)

O desenvolvimento passou por diversas etapas de refinamento para chegar à arquitetura atual:

1. **Estruturação da Interface (Frontend)**:
   - Utilizamos **Next.js (React)** para criar um aplicativo rápido que roda tanto no navegador quanto como um app (PWA / Capacitor).
   - Implementamos a Web Speech API (`window.speechSynthesis`) para criar a voz robótica que orienta o deficiente visual em cada interação.
   - Telas divididas em módulos (Passageiro, Motorista, Auth).

2. **Backend e Inteligência (Backend)**:
   - Construído com **Fastify (Node.js)** por sua altíssima performance.
   - Uso de **PostgreSQL** (com **Prisma ORM**) para guardar usuários, laudos médicos, dados dos pontos de ônibus e rotas.
   - Implementação do **MinIO** (tipo um S3 próprio) para armazenar os documentos e fotos de forma segura.

3. **Integração e Orquestração (Docker)**:
   - Todo o sistema foi empacotado usando **Docker** e **Docker Compose**, garantindo que banco de dados, frontend, backend e proxy (Nginx) rodem com um único comando, sem problemas de configuração de ambiente.

---

## 🛠️ Stack Tecnológica Completa (Github)

Se você for colocar este projeto no **GitHub**, a stack tecnológica detalhada é:

- **Frontend**: `Next.js 16` | `React 19` | `Tailwind CSS 4` | `Lucide React` (Ícones).
- **Backend**: `Fastify 5` | `Node.js` | `TypeScript`.
- **Banco de Dados**: `PostgreSQL 17` | `Prisma ORM`.
- **Armazenamento / Storage**: `MinIO` (S3 Compatible).
- **Infra e Deploy**: `Docker` | `Docker Compose` | `Nginx`.

---

## ⚙️ Como Executar o Projeto Localmente (Instruções para GitHub)

Caso deseje clonar do Github e rodar, os passos são:

1. Clone o repositório.
2. Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.
3. Na raiz do projeto, execute:
   ```bash
   docker compose up -d
   ```
4. O Docker vai baixar as imagens e iniciar os serviços:
   - **Frontend**: Acessível em `http://localhost:3000` (e via proxy em `http://localhost`)
   - **Backend API**: Acessível em `http://localhost:3333`
   - **MinIO Console**: Acessível em `http://localhost:9001`
   - **PostgreSQL**: Rodando na porta `5432`

---

## ⏭️ Próximos Passos
O aplicativo está documentado e a estrutura base (Frontend e Backend + Docker) está pronta para ser expandida. 

*(Aguardando as instruções para o Aplicativo Final)*
