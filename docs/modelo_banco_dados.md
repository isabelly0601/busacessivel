# Modelo de Banco de Dados (MVP)

O esquema abaixo representa as tabelas necessárias para o funcionamento do MVP do BusAcessível, focando em simplicidade e eficácia.

```prisma
// schema.prisma

model Passageiro {
  id                String    @id @default(uuid())
  telefone          String    @unique
  deviceId          String    @unique
  nomePreferencial  String?
  statusConta       String    @default("ativo") // ativo, banido, em_analise
  criadoEm          DateTime  @default(now())
  solicitacoes      SolicitacaoEmbarque[]
}

model PontoOnibus {
  id                String    @id @default(uuid())
  nomeDescricao     String
  latitude          Decimal   @db.Decimal(10, 8)
  longitude         Decimal   @db.Decimal(10, 8)
  solicitacoes      SolicitacaoEmbarque[]
}

model VeiculoLinha {
  id                String    @id @default(uuid())
  codigoLinha       String
  placaVeiculo      String?
  acessibilidadeOk  Boolean   @default(true)
}

model SolicitacaoEmbarque {
  id                  String      @id @default(uuid())
  passageiro          Passageiro  @relation(fields: [passageiroId], references: [id])
  passageiroId        String
  ponto               PontoOnibus @relation(fields: [pontoId], references: [id])
  pontoId             String
  codigoLinhaDesejada String
  
  latitudePassageiro  Decimal     @db.Decimal(10, 8)
  longitudePassageiro Decimal     @db.Decimal(10, 8)
  
  status              String      @default("aguardando") // aguardando, onibus_notificado, embarcado, cancelado
  criadoEm            DateTime    @default(now())
  atualizadoEm        DateTime    @updatedAt
}
```

## Relacionamentos
- Um **Passageiro** pode ter várias **Solicitações**.
- Um **Ponto de Ônibus** pode ter várias **Solicitações** simultâneas de passageiros diferentes.
- A **Solicitação** é o elo central que conecta a localização exata do passageiro ao ponto oficial.
