/**
 * Script de Importação GTFS - BHTrans / Belo Horizonte (Versão de Baixo Consumo de Memória)
 *
 * Baixa o GTFS oficial da BHTrans e popula o banco com:
 *  - Todos os pontos de parada (PontoOnibus)
 *  - Todas as linhas (Linha)
 *  - Associação de pontos por linha (LinhaPonto), com ordem de parada
 *
 * Fonte: https://s3.amazonaws.com/mobilibus-uploads/gtfs/GTFSBHTRANS.zip
 *
 * Uso: npx ts-node src/scripts/import-gtfs.ts
 */

import https from 'https'
import http from 'http'
import { createWriteStream, createReadStream, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createInterface } from 'readline'
import AdmZip from 'adm-zip'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// ─── Configuração do Prisma ───────────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── Constantes ───────────────────────────────────────────────────────────────
const GTFS_URL = 'https://s3.amazonaws.com/mobilibus-uploads/gtfs/GTFSBHTRANS.zip'
const TMP_DIR = join(__dirname, '..', '..', 'tmp')
const ZIP_PATH = join(TMP_DIR, 'GTFSBHTRANS.zip')
const EXTRACT_DIR = join(TMP_DIR, 'gtfs')

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Baixa um arquivo via HTTP/HTTPS, seguindo redirecionamentos */
function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = createWriteStream(destPath)

    protocol.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close()
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject)
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode} ao baixar ${url}`))
      }
      response.pipe(file)
      file.on('finish', () => file.close(() => resolve()))
    }).on('error', (err) => {
      file.close()
      reject(err)
    })
  })
}

/** Parseia uma linha CSV tratando aspas adequadamente */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

/** Lê um arquivo CSV de forma streaming linha por linha */
async function processLineByLine(filePath: string, onRow: (row: Record<string, string>) => Promise<void>): Promise<number> {
  const fileStream = createReadStream(filePath)
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let headers: string[] = []
  let isFirst = true
  let count = 0

  for await (const line of rl) {
    const cleanLine = line.replace(/^\uFEFF/, '').trim()
    if (!cleanLine) continue

    const values = parseCSVLine(cleanLine)
    if (isFirst) {
      headers = values.map(h => h.toLowerCase())
      isFirst = false
      continue
    }

    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = values[i] ?? ''
    })

    await onRow(row)
    count++
  }

  return count
}

/** Encontra um arquivo extraído no diretório temporário */
function findGtfsFile(filename: string): string {
  const directPath = join(EXTRACT_DIR, filename)
  if (existsSync(directPath)) return directPath
  const subPath = join(EXTRACT_DIR, 'gtfs', filename)
  if (existsSync(subPath)) return subPath
  throw new Error(`Arquivo GTFS ${filename} não encontrado no ZIP extraído.`)
}

/** Exibe progresso no console */
function progress(msg: string) {
  process.stdout.write(`\r\x1b[K${msg}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  🚍 Importador GTFS BHTrans — BusAcessível       ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log()

  // 1. Preparar diretório temporário
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })
  if (!existsSync(EXTRACT_DIR)) mkdirSync(EXTRACT_DIR, { recursive: true })

  // 2. Baixar o GTFS se não existir localmente para poupar banda em restarts
  if (!existsSync(ZIP_PATH)) {
    console.log(`📥 Baixando GTFS oficial da BHTrans...`)
    console.log(`   URL: ${GTFS_URL}`)
    await downloadFile(GTFS_URL, ZIP_PATH)
    console.log(`✅ Download concluído!\n`)
  } else {
    console.log(`📦 Usando arquivo zip do GTFS existente localmente.`)
  }

  // 3. Extrair o ZIP
  console.log(`📦 Extraindo arquivos...`)
  const zip = new AdmZip(ZIP_PATH)
  zip.extractAllTo(EXTRACT_DIR, true)
  console.log(`✅ Extração concluída!\n`)

  // Encontrar os arquivos de texto extraídos
  const stopsPath = findGtfsFile('stops.txt')
  const routesPath = findGtfsFile('routes.txt')
  const tripsPath = findGtfsFile('trips.txt')
  const stopTimesPath = findGtfsFile('stop_times.txt')

  // 4. Importar Pontos de Parada (stops.txt) em lotes (Streaming)
  console.log(`📍 Importando pontos de parada...`)
  let stopsBatch: any[] = []
  let totalStops = 0

  await processLineByLine(stopsPath, async (row) => {
    const lat = parseFloat(row.stop_lat)
    const lng = parseFloat(row.stop_lon)
    if (row.stop_id && row.stop_name && !isNaN(lat) && !isNaN(lng)) {
      stopsBatch.push({
        externalId: row.stop_id,
        nomeDescricao: row.stop_name,
        latitude: lat,
        longitude: lng
      })

      if (stopsBatch.length >= 1000) {
        await prisma.pontoOnibus.createMany({
          data: stopsBatch,
          skipDuplicates: true
        })
        totalStops += stopsBatch.length
        progress(`   ${totalStops.toLocaleString('pt-BR')} pontos inseridos no banco...`)
        stopsBatch = []
      }
    }
  })

  if (stopsBatch.length > 0) {
    await prisma.pontoOnibus.createMany({
      data: stopsBatch,
      skipDuplicates: true
    })
    totalStops += stopsBatch.length
  }
  console.log(`\n✅ ${totalStops.toLocaleString('pt-BR')} pontos processados!\n`)

  // 5. Importar Linhas (routes.txt) em lotes (Streaming)
  console.log(`🛣️  Importando linhas (routes)...`)
  let routesBatch: any[] = []
  let totalRoutes = 0
  const routeIdToCodigo = new Map<string, string>() // route_id -> codigo

  await processLineByLine(routesPath, async (row) => {
    if (row.route_id) {
      const codigo = row.route_short_name || row.route_long_name || row.route_id
      const nome = row.route_long_name || row.route_short_name || `Linha ${row.route_id}`
      
      routeIdToCodigo.set(row.route_id, codigo)
      routesBatch.push({
        codigo,
        nome
      })

      if (routesBatch.length >= 500) {
        await prisma.linha.createMany({
          data: routesBatch,
          skipDuplicates: true
        })
        totalRoutes += routesBatch.length
        progress(`   ${totalRoutes.toLocaleString('pt-BR')} linhas inseridas no banco...`)
        routesBatch = []
      }
    }
  })

  if (routesBatch.length > 0) {
    await prisma.linha.createMany({
      data: routesBatch,
      skipDuplicates: true
    })
    totalRoutes += routesBatch.length
  }
  console.log(`\n✅ ${totalRoutes.toLocaleString('pt-BR')} linhas processadas!\n`)

  // 6. Construir mapeamento: seleciona a primeira viagem (trip) de cada rota
  console.log(`🔗 Mapeando viagens selecionadas de trips.txt...`)
  const routeToTrip = new Map<string, string>() // route_id -> trip_id
  const tripToRoute = new Map<string, string>() // trip_id -> route_id

  await processLineByLine(tripsPath, async (row) => {
    const routeId = row.route_id
    const tripId = row.trip_id
    if (routeId && tripId && !routeToTrip.has(routeId)) {
      routeToTrip.set(routeId, tripId)
      tripToRoute.set(tripId, routeId)
    }
  })
  console.log(`   Selecionadas ${routeToTrip.size.toLocaleString('pt-BR')} viagens padrão (uma por linha).\n`)

  // 7. Filtrar e ler as paradas de stop_times.txt para apenas as viagens selecionadas
  console.log(`🕐 Processando paradas de stop_times.txt para viagens selecionadas...`)
  const tripStopsMap = new Map<string, Array<{stop_id: string, order: number}>>()

  let stopTimesProcessed = 0
  await processLineByLine(stopTimesPath, async (row) => {
    const tripId = row.trip_id
    stopTimesProcessed++
    if (stopTimesProcessed % 50000 === 0) {
      progress(`   Analisadas ${stopTimesProcessed.toLocaleString('pt-BR')} linhas do stop_times...`)
    }

    if (!tripId || !tripToRoute.has(tripId)) return

    const stopId = row.stop_id
    const order = parseInt(row.stop_sequence) || 0

    if (stopId) {
      const list = tripStopsMap.get(tripId) || []
      list.push({ stop_id: stopId, order })
      tripStopsMap.set(tripId, list)
    }
  })
  console.log(`\n   Coletadas paradas de todas as viagens de interesse.\n`)

  // 8. Buscar todos os IDs reais das Linhas e Pontos do banco de dados
  console.log(`🔍 Carregando mapeamentos de IDs do banco de dados...`)
  
  const databaseLinhas = await prisma.linha.findMany({ select: { id: true, codigo: true } })
  const codigoToLinhaId = new Map<string, string>()
  databaseLinhas.forEach(l => codigoToLinhaId.set(l.codigo, l.id))
  console.log(`   Mapeadas ${codigoToLinhaId.size} linhas do banco.`)

  const databasePontos = await prisma.pontoOnibus.findMany({ select: { id: true, externalId: true } })
  const externalToPontoId = new Map<string, string>()
  databasePontos.forEach(p => { if (p.externalId) externalToPontoId.set(p.externalId, p.id) })
  console.log(`   Mapeados ${externalToPontoId.size} pontos de parada do banco.\n`)

  // 9. Limpar LinhaPonto existente e recriar
  console.log(`🗑️  Limpando associações antigas do banco de dados...`)
  await prisma.linhaPonto.deleteMany()
  console.log(`✅ Limpeza concluída!\n`)

  // 10. Criar novas associações LinhaPonto
  console.log(`🏗️  Inserindo novas associações linha ↔ pontos...`)
  let lpBatch: any[] = []
  let totalLpInserted = 0
  let processedLines = 0

  for (const [routeId, tripId] of routeToTrip) {
    processedLines++
    const codigo = routeIdToCodigo.get(routeId)
    if (!codigo) continue

    const prismaLinhaId = codigoToLinhaId.get(codigo)
    if (!prismaLinhaId) continue

    const stopsList = tripStopsMap.get(tripId) || []
    stopsList.sort((a, b) => a.order - b.order)

    for (const s of stopsList) {
      const prismaPontoId = externalToPontoId.get(s.stop_id)
      if (!prismaPontoId) continue

      lpBatch.push({
        linhaId: prismaLinhaId,
        pontoId: prismaPontoId,
        ordemParada: s.order
      })

      if (lpBatch.length >= 1000) {
        await prisma.linhaPonto.createMany({
          data: lpBatch,
          skipDuplicates: true
        })
        totalLpInserted += lpBatch.length
        progress(`   Processadas ${processedLines} linhas (${totalLpInserted.toLocaleString('pt-BR')} associações)...`)
        lpBatch = []
      }
    }
  }

  if (lpBatch.length > 0) {
    await prisma.linhaPonto.createMany({
      data: lpBatch,
      skipDuplicates: true
    })
    totalLpInserted += lpBatch.length
  }
  console.log(`\n✅ Associações concluídas!\n`)

  // 11. Limpeza de arquivos temporários para poupar espaço em disco
  console.log(`🧹 Limpando arquivos temporários...`)
  try {
    unlinkSync(ZIP_PATH)
  } catch (_) {}
  console.log(`✅ Limpeza concluída!\n`)

  // 12. Sumário Final
  const finalPontos = await prisma.pontoOnibus.count()
  const finalLinhas = await prisma.linha.count()
  const finalLp = await prisma.linhaPonto.count()

  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  ✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!             ║')
  console.log('╠══════════════════════════════════════════════════╣')
  console.log(`║  📍 Pontos no banco:      ${String(finalPontos.toLocaleString('pt-BR')).padEnd(22)}║`)
  console.log(`║  🛣️  Linhas no banco:      ${String(finalLinhas.toLocaleString('pt-BR')).padEnd(22)}║`)
  console.log(`║  🔗 Associações criadas:  ${String(finalLp.toLocaleString('pt-BR')).padEnd(22)}║`)
  console.log('╚══════════════════════════════════════════════════╝')
}

main()
  .catch((e) => {
    console.error('\n❌ Erro durante a importação:', e.message || e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
