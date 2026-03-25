import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Limpar dados existentes
  await prisma.solicitacaoEmbarque.deleteMany()
  await prisma.passageiro.deleteMany()
  await prisma.pontoOnibus.deleteMany()

  // 2. Criar Pontos de Ônibus (Exemplos reais BH)
  await prisma.pontoOnibus.createMany({
    data: [
      {
        nomeDescricao: "Ponto Praça da Liberdade",
        latitude: -19.9322,
        longitude: -43.9378,
      },
      {
        nomeDescricao: "Ponto Savassi (Rua Pernambuco)",
        latitude: -19.9385,
        longitude: -43.9351,
      },
      {
        nomeDescricao: "Ponto Mercado Central",
        latitude: -19.9231,
        longitude: -43.9450,
      }
    ]
  })

  console.log('Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
