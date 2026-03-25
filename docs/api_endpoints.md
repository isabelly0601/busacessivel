# API Endpoints (REST)

Base da comunicação entre os aplicativos de Passageiro e Motorista.

## Autenticação
- `POST /api/auth/solicitar-codigo`: Inicia o fluxo enviando SMS.
- `POST /api/auth/validar-codigo`: Finaliza o vínculo e retorna o JWT.

## Passageiro
- `GET /api/pontos/proximos?lat=&lng=`: Retorna lista de pontos num raio de 500m.
- `GET /api/linhas/ponto/:pontoId`: Lista linhas que passam no ponto específico.
- `POST /api/embarque/solicitar`: Cria uma nova intenção de embarque.
- `GET /api/embarque/:id/status`: Polling para verificar se o ônibus está chegando.
- `PATCH /api/embarque/:id/cancelar`: Cancela a solicitação.

## Motorista
- `GET /api/motorista/alertas?linha=&lat=&lng=`: Endpoint principal do motorista. O backend verifica se há passageiros no trajeto à frente.
- `PATCH /api/embarque/:id/notificar-onibus`: O sistema ou o motorista confirma que o passageiro foi avistado/notificado.

## Gerenciamento (Opcional MVP)
- `POST /api/pontos`: Cadastro de novos pontos de parada.
- `POST /api/linhas`: Cadastro de novas linhas/veículos.
