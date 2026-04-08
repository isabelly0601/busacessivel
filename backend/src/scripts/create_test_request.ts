import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('[TEST] Iniciando script de simulação de passageiro...');

    // 1. Buscar o ponto criado pelo seed
    const ponto = await prisma.pontoOnibus.findFirst({
        where: { nomeDescricao: { contains: "Praça da Liberdade" } }
    });

    if (!ponto) {
        console.error('❌ Ponto "Praça da Liberdade" não encontrado. Certifique-se de que o seed rodou.');
        process.exit(1);
    }

    // 2. Criar ou buscar um usuário de teste
    const user = await prisma.user.upsert({
        where: { telefone: "31999999999" },
        update: {},
        create: {
            nome: "Joao Teste Acessível",
            role: "PASSAGEIRO",
            telefone: "31999999999",
            passageiro: {
                create: { deviceId: "id-dispositivo-teste-001" }
            }
        },
        include: { passageiro: true }
    });

    if (!user.passageiro) {
        console.error('❌ Usuário de teste não possui perfil de passageiro.');
        process.exit(1);
    }

    // 3. Criar a solicitação de embarque para a linha SC01A
    const solicitacao = await prisma.solicitacaoEmbarque.create({
        data: {
            passageiroId: user.passageiro.id,
            pontoId: ponto.id,
            codigoLinhaDesejada: "SC01A",
            latitudePassageiro: ponto.latitude,
            longitudePassageiro: ponto.longitude,
            status: "aguardando"
        }
    });

    console.log(`✅ [SUCESSO] Solicitação de embarque criada!`);
    console.log(`   - Linha: SC01A`);
    console.log(`   - Ponto: ${ponto.nomeDescricao}`);
    console.log(`   - ID Solicitação: ${solicitacao.id}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
