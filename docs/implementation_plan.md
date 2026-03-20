# Plano de Implementação: BusAcessível MVP (Versão Melhorada)

Entendi perfeitamente a sua visão! O objetivo principal não é apenas um botão numa tela, mas criar um **assistente de mobilidade autônomo e responsivo** para o deficiente visual, utilizando recursos nativos do dispositivo (GPS, Microfone e Alto-falante) e integrando em tempo real com a frota de transporte coletivo.

## Arquitetura do Novo MVP

### 1. Geolocalização e Avisos Sonoros (App do Passageiro)
- O aplicativo fará o rastreamento em tempo real do passageiro utilizando a API de **Localização (GPS)**.
- **Biper de Ponto (Som 1)**: Ao se aproximar de um ponto de ônibus cadastrado, o app emitirá um **som de notificação específico (ex: um bip agudo)** confirmando que o usuário está posicionado corretamente num local seguro de embarque.
- **Biper de Aproximação (Som 2)**: Quando o motorista (da linha que o usuário solicitou) estiver se aproximando do ponto, o app começará a emitir um **som contínuo (ex: um radar sonar)**, acelerando conforme a proximidade diminui, guiando o passageiro no momento do embarque.

### 2. Comando de Voz Interativo (Speech-to-Text)
- O aplicativo abandonará cliques complexos no lado do passageiro.
- A tela principal terá uma área massiva que ouvirá o usuário continuamente ou ao ser tocada.
- O passageiro apenas **falará** o ônibus que deseja (ex: *"Quero pegar o ônibus 101"* ou *"Linha Centro"*).
- O app usará a **Web Speech Recognition API** para converter a voz, abstrair a linha, e enviar silenciosa e magicamente o alerta para o motorista exato.

### 3. Painel do Motorista (Visual Premium)
- O dashboard será elevado a um visual belíssimo de alta performance ("Dark Mode", componentes de vidro translúcido, gradientes e animações suaves).
- O motorista verá a distância do passageiro PCD que está nos próximos pontos ou apenas receberá o "Sinal de Embarque" quando estiver a <1km do passageiro.

---

## Status Atual vs Etapas do MVP

### ✅ Etapa 0: Fundações e Infraestrutura (Concluído)
- Containers Docker (`busacessivel`) funcionando com Fastify, Prisma, Next.js e TailwindCSS v4.
- Banco de Dados PostgreSQL provisionado.
- Backend já suporta persistência de chamados.

### 🚀 Etapa 1: Aprimoramento Visual e Voz Interativa
- **Interface Premium**: Vamos reconstruir ambas as telas com estética rica, fluída e alto contraste. Cores harmoniosas, grandes proporções tipográficas (Outfit / Inter) e micro-animações.
- **Voz Transcrita**: Programar o Frontend do Passageiro para ouvir o microfone, extrair o número do ônibus da fala e disparar a requisição API automaticamente.

### 🚀 Etapa 2: Motor de GPS e Avisos Sonoros
- Inserir arquivos MP3 ou osciladores curtos e reproduzi-los dependendo de "Mocks" de GPS (simulando a distância em metros do passageiro ao ponto, e do ônibus ao passageiro).
- Implementar as rotinas no painel do motorista onde ele atualiza a sua localização e o servidor avisa o passageiro.

## Aprovação Requerida
Por favor, analise as etapas acima. Se concordar que esta arquitetura captura a exata essência de auxiliar eficientemente o embarque como você descreveu, prosseguirei imediatamente com a **Etapa 1 (Voz e Novo Design)**.
