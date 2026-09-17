import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- Iniciando Seed v2.1 (Linhas e Ônibus) ---')

  // 1. Limpar dados para garantir idempotência (CUIDADO: Limpa tudo!)
  await prisma.solicitacaoEmbarque.deleteMany()
  await prisma.motorista.deleteMany()
  await prisma.passageiro.deleteMany()
  await prisma.onibus.deleteMany()
  await prisma.linhaPonto.deleteMany()   // FK para Linha e PontoOnibus — limpar antes!
  await prisma.linha.deleteMany()
  await prisma.pontoOnibus.deleteMany()
  await prisma.user.deleteMany()

  // 2. Criar Pontos de Ônibus (BH)
  const pontos = [
    { nome: "Ponto Praça da Liberdade", lat: -19.9322, lng: -43.9378, ext: "BH-LIB-01" },
    { nome: "Ponto Savassi (Pernambuco)", lat: -19.9385, lng: -43.9351, ext: "BH-SAV-01" },
    { nome: "Ponto Estação Pampulha", lat: -19.8519, lng: -43.9514, ext: "BH-PAM-01" },
    { nome: "Ponto Mercado Central", lat: -19.9231, lng: -43.9450, ext: "BH-MER-01" },
    { nome: "Ponto Avenida do Contorno", lat: -19.9405, lng: -43.9285, ext: "BH-CON-01" }
  ];

  for (const p of pontos) {
    await prisma.pontoOnibus.create({
      data: { nomeDescricao: p.nome, latitude: p.lat, longitude: p.lng, externalId: p.ext }
    });
  }

  // 3. Criar Linhas Solicitadas
  const codigosLinhas = [
    "55", "SC01A", "2151", "8405", "2101", "8101", "8103", 
    "2391", "2390", "2290", "5534", "9208", "5035", "5036"
  ];

  let busCounter = 0;
  for (const codigo of codigosLinhas) {
    const linha = await prisma.linha.upsert({
      where: { codigo: codigo },
      update: {},
      create: { 
        codigo: codigo, 
        nome: `Linha ${codigo}`,
        metropolitana: ["2391", "2390", "2290", "5036"].includes(codigo)
      }
    });

    // 4. Criar um Ônibus de teste para cada linha (Upsert para evitar duplicidade de placa)
    const placa = `TST-${String(busCounter++).padStart(4, '0')}`;
    await prisma.onibus.upsert({
      where: { placa: placa },
      update: { linhaId: linha.id },
      create: {
        placa: placa,
        prefixo: `${codigo}01`,
        linhaId: linha.id
      }
    });
  }

  console.log(`✅ ${codigosLinhas.length} Linhas e Ônibus criados com sucesso!`);

  // 5. Motorista de Teste
  await prisma.user.upsert({
    where: { cpf: "11111111111" },
    update: {},
    create: {
      nome: "Motorista de Teste",
      cpf: "11111111111",
      telefone: "31988888888",
      role: "MOTORISTA",
      motorista: { create: { cnh: "123456789" } }
    }
  });

  // 6. Passageiro de Teste (Com preferências de acessibilidade)
  await prisma.user.upsert({
    where: { cpf: "22222222222" },
    update: {},
    create: {
      nome: "Passageiro de Teste (VSA)",
      cpf: "22222222222",
      telefone: "31977777777",
      role: "PASSAGEIRO",
      passageiro: { 
        create: { 
          preferenciasAcess: "<strong>Necessito de rampa para cadeira de rodas.</strong>" 
        } 
      }
    }
  });

  // 7. Administrador do Sistema
  await prisma.user.upsert({
    where: { cpf: "00000000000" },
    update: {},
    create: {
      nome: "Admin BusAcessível",
      cpf: "00000000000",
      telefone: "31900000000",
      email: "admin@busacessivel.com.br",
      role: "ADMIN"
    }
  });

  console.log(`✅ Passageiro e Admin criados.`);

  // 8. Log de Auditoria Inicial
  await prisma.auditLog.create({
    data: {
      acao: "SEED_DATABASE",
      detalhes: "Banco de dados inicializado com sucesso para o baseline 2026."
    }
  });

  console.log('--- Seed finalizado com sucesso ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

