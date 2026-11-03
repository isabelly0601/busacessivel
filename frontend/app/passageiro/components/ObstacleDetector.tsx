"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface ObstacleDetectorProps {
  falar: (texto: string) => void;
  vibrar: (ms: number | number[]) => void;
  active: boolean;
}

// Dicionário completo traduzindo todas as classes do COCO-SSD + classes de visão computacional
const CLASS_PT: Record<string, string> = {
  // Pessoas e Veículos
  'person': 'pessoa',
  'bicycle': 'bicicleta',
  'car': 'carro',
  'motorcycle': 'moto',
  'motorbike': 'moto',
  'airplane': 'avião',
  'bus': 'ônibus',
  'train': 'trem',
  'truck': 'caminhão',
  'boat': 'barco',
  'traffic light': 'semáforo',
  'fire hydrant': 'hidrante',
  'stop sign': 'placa de pare',
  'parking meter': 'parquímetro',
  'bench': 'banco',

  // Animais
  'bird': 'pássaro',
  'cat': 'gato',
  'dog': 'cachorro',
  'horse': 'cavalo',
  'sheep': 'ovelha',
  'cow': 'vaca',
  'elephant': 'elefante',
  'bear': 'urso',
  'zebra': 'zebra',
  'giraffe': 'girafa',

  // Objetos Pessoais e Acessórios
  'backpack': 'mochila',
  'umbrella': 'guarda-chuva',
  'handbag': 'bolsa',
  'tie': 'gravata',
  'suitcase': 'mala',
  'frisbee': 'frisbee',
  'skis': 'esqui',
  'snowboard': 'prancha de neve',
  'sports ball': 'bola',
  'kite': 'pipa',
  'baseball bat': 'taco de beisebol',
  'baseball glove': 'luva de beisebol',
  'skateboard': 'skate',
  'surfboard': 'prancha de surfe',
  'tennis racket': 'raquete',
  'bottle': 'garrafa',
  'wine glass': 'taça',
  'cup': 'copo',
  'fork': 'garfo',
  'knife': 'faca',
  'spoon': 'colher',
  'bowl': 'tigela',
  'banana': 'banana',
  'apple': 'maçã',
  'sandwich': 'sanduíche',
  'orange': 'laranja',
  'broccoli': 'brócolis',
  'carrot': 'cenoura',
  'hot dog': 'cachorro-quente',
  'pizza': 'pizza',
  'donut': 'rosquinha',
  'cake': 'bolo',

  // Móveis, Eletrodomésticos e Ambiente
  'chair': 'cadeira',
  'couch': 'sofá',
  'sofa': 'sofá',
  'wheelchair': 'cadeira de rodas',
  'potted plant': 'vaso de planta',
  'bed': 'cama',
  'dining table': 'mesa',
  'toilet': 'vaso sanitário',
  'tv': 'televisão',
  'tvmonitor': 'televisão',
  'laptop': 'notebook',
  'mouse': 'mouse',
  'remote': 'controle remoto',
  'keyboard': 'teclado',
  'cell phone': 'celular',
  'microwave': 'micro-ondas',
  'oven': 'forno',
  'toaster': 'torradeira',
  'sink': 'pia',
  'refrigerator': 'geladeira',
  'book': 'livro',
  'clock': 'relógio',
  'vase': 'vaso',
  'scissors': 'tesoura',
  'teddy bear': 'urso de pelúcia',
  'hair drier': 'secador',
  'toothbrush': 'escova de dentes',

  // Detecções Visuais Customizadas (Visão Computacional)
  'degrau': 'degrau',
  'escada': 'escada',
  'obstaculo': 'obstáculo',
};

const DANGER_CLASSES = Object.keys(CLASS_PT);

// Detecta degraus e escadas de forma rígida para EVITAR FALSOS POSITIVOS em pisos planos
function detectStepsAndStairs(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { class: string; score: number; bbox: [number, number, number, number] } | null {
  if (!width || !height || width <= 0 || height <= 0) return null;

  // Analisa exclusivamente a região do chão próximo (entre 55% e 92% da altura)
  const startY = Math.floor(height * 0.55);
  const endY = Math.floor(height * 0.92);
  const roiHeight = endY - startY;
  if (roiHeight < 30) return null;

  try {
    const imgData = ctx.getImageData(0, startY, width, roiHeight);
    const data = imgData.data;

    const rowEdgeCounts = new Int32Array(roiHeight);
    // Linha precisa ser ampla (pelo menos 35% da largura da tela)
    const minLinePixels = Math.floor(width * 0.35);
    const stepX = 2; // Amostragem precisa a cada 2px

    for (let y = 2; y < roiHeight - 2; y++) {
      let edgeCount = 0;
      let maxContinuous = 0;
      let currentContinuous = 0;

      const prevRow = (y - 2) * width * 4;
      const nextRow = (y + 2) * width * 4;

      for (let x = 0; x < width; x += stepX) {
        const idxPrev = prevRow + x * 4;
        const idxNext = nextRow + x * 4;

        // Luminância Y = 0.299R + 0.587G + 0.114B
        const lumPrev = data[idxPrev] * 0.299 + data[idxPrev + 1] * 0.587 + data[idxPrev + 2] * 0.114;
        const lumNext = data[idxNext] * 0.299 + data[idxNext + 1] * 0.587 + data[idxNext + 2] * 0.114;

        // Limiar alto (65) para filtrar rejuntes de piso, pisos estampados e sombras fracas
        if (Math.abs(lumNext - lumPrev) > 65) {
          edgeCount++;
          currentContinuous++;
          if (currentContinuous > maxContinuous) maxContinuous = currentContinuous;
        } else {
          currentContinuous = 0;
        }
      }

      // Requer contagem alta e um segmento contínuo significativo
      if (edgeCount > (minLinePixels / stepX) && maxContinuous > ((width * 0.25) / stepX)) {
        rowEdgeCounts[y] = edgeCount;
      }
    }

    // Identifica posições de linhas de alto contraste sobressalentes
    const linePositions: number[] = [];
    for (let y = 2; y < roiHeight - 2; y++) {
      if (
        rowEdgeCounts[y] > 0 &&
        rowEdgeCounts[y] >= rowEdgeCounts[y - 1] &&
        rowEdgeCounts[y] >= rowEdgeCounts[y + 1] &&
        rowEdgeCounts[y] >= rowEdgeCounts[y - 2] &&
        rowEdgeCounts[y] >= rowEdgeCounts[y + 2]
      ) {
        if (
          linePositions.length === 0 ||
          y - linePositions[linePositions.length - 1] >= 10
        ) {
          linePositions.push(y);
        }
      }
    }

    // Escada: pelo menos 3 linhas paralelas distintas
    if (linePositions.length >= 3) {
      const firstY = startY + linePositions[0];
      const lastY = startY + linePositions[linePositions.length - 1];
      const boxY = Math.max(0, firstY - 10);
      const boxH = Math.min(height - boxY, lastY - firstY + 25);
      const boxX = Math.floor(width * 0.1);
      const boxW = Math.floor(width * 0.8);

      return {
        class: 'escada',
        score: Math.min(0.95, 0.70 + linePositions.length * 0.05),
        bbox: [boxX, boxY, boxW, boxH],
      };
    } 
    // Degrau: EXIGE 2 linhas paralelas próximas (topo e sombra da quina/espelho)
    // Isso elimina falsos positivos de linhas avulsas (como rejunte de azulejo, tapete ou sombra simples)
    else if (linePositions.length >= 2) {
      const dist = linePositions[1] - linePositions[0];
      if (dist >= 8 && dist <= 45) {
        const lineY = startY + linePositions[0];
        const boxY = Math.max(0, lineY - 10);
        const boxH = Math.min(height - boxY, dist + 18);
        const boxX = Math.floor(width * 0.1);
        const boxW = Math.floor(width * 0.8);

        return {
          class: 'degrau',
          score: 0.85,
          bbox: [boxX, boxY, boxW, boxH],
        };
      }
    }
  } catch {
    // Retorno seguro
  }

  return null;
}

// Detecta obstáculos genéricos (postes, pilares, lixeiras, caixas) no centro do caminho
function detectGenericObstacle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  existingDetectionsCount: number
): { class: string; score: number; bbox: [number, number, number, number] } | null {
  if (existingDetectionsCount > 0 || !width || !height) return null;

  try {
    const startX = Math.floor(width * 0.25);
    const startY = Math.floor(height * 0.25);
    const roiW = Math.floor(width * 0.50);
    const roiH = Math.floor(height * 0.50);

    const imgData = ctx.getImageData(startX, startY, roiW, roiH);
    const data = imgData.data;

    let edgeCount = 0;
    const totalPixels = (roiW * roiH) / 16;

    for (let i = 0; i < data.length - 16; i += 16) {
      const lumCurr = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const lumNext = data[i + 16] * 0.299 + data[i + 17] * 0.587 + data[i + 18] * 0.114;
      if (Math.abs(lumNext - lumCurr) > 45) {
        edgeCount++;
      }
    }

    // Se o centro tem alta densidade de contraste visual ocupando > 25% da tela frontal
    if (edgeCount / totalPixels > 0.25) {
      return {
        class: 'obstaculo',
        score: 0.72,
        bbox: [startX, startY, roiW, roiH],
      };
    }
  } catch {
    // Retorno seguro
  }

  return null;
}

export default function ObstacleDetector({ falar, vibrar, active }: ObstacleDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastGlobalAlertRef = useRef<number>(0);
  const lastAlertPerClassRef = useRef<Record<string, number>>({});
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lastObject, setLastObject] = useState('');

  // Detecção contínua
  const detect = useCallback(async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      // Threshold 0.28 para capturar QUALQUER objeto visível na frente
      const preds = await modelRef.current.detect(video);
      const foundObjects: Array<{ class: string; score: number; bbox: [number, number, number, number] }> = preds
        .filter((p: any) => DANGER_CLASSES.includes(p.class) && p.score > 0.28)
        .map((p: any) => ({ class: p.class, score: p.score, bbox: p.bbox as [number, number, number, number] }));

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Algoritmos de visão computacional adicionais
        const stepOrStair = detectStepsAndStairs(ctx, canvas.width, canvas.height);
        const genericObstacle = detectGenericObstacle(ctx, canvas.width, canvas.height, foundObjects.length);

        const allDetections = [...foundObjects];
        if (stepOrStair) allDetections.push(stepOrStair);
        if (genericObstacle) allDetections.push(genericObstacle);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const now = Date.now();

        // Desenha caixas de marcação na tela
        allDetections.forEach((obj) => {
          const [x, y, w, h] = obj.bbox;
          const name = CLASS_PT[obj.class] || obj.class;
          const area = (w * h) / (canvas.width * canvas.height);
          const isClose = area > 0.16 || obj.class === 'degrau' || obj.class === 'escada';

          let strokeColor = '#f59e0b'; // Amarelo
          if (obj.class === 'escada' || obj.class === 'degrau') strokeColor = '#f97316'; // Laranja
          if (isClose) strokeColor = '#ef4444'; // Vermelho

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, w, h);

          const labelText = `${name.toUpperCase()} (${Math.round(obj.score * 100)}%)`;
          ctx.font = 'bold 14px sans-serif';
          const textWidth = ctx.measureText(labelText).width;

          const tagY = Math.max(0, y - 24);
          ctx.fillStyle = strokeColor;
          ctx.fillRect(x, tagY, textWidth + 12, 24);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, x + 6, tagY + 17);
        });

        // Alertas por voz
        if (allDetections.length > 0) {
          const priorityOrder = ['escada', 'degrau', 'car', 'bus', 'truck', 'motorcycle', 'bicycle', 'person', 'chair', 'couch', 'bench', 'obstaculo'];
          allDetections.sort((a, b) => {
            const pA = priorityOrder.indexOf(a.class);
            const pB = priorityOrder.indexOf(b.class);
            const scoreA = pA !== -1 ? pA : 99;
            const scoreB = pB !== -1 ? pB : 99;
            return scoreA - scoreB;
          });

          const topObj = allDetections[0];
          const name = CLASS_PT[topObj.class] || topObj.class;
          const lastAlertForClass = lastAlertPerClassRef.current[topObj.class] || 0;
          const timeSinceGlobal = now - lastGlobalAlertRef.current;
          const timeSinceClass = now - lastAlertForClass;

          if (timeSinceGlobal > 2200 && timeSinceClass > 3800) {
            const area = (topObj.bbox[2] * topObj.bbox[3]) / (canvas.width * canvas.height);
            const isVeryClose = area > 0.18 || topObj.class === 'degrau' || topObj.class === 'escada';

            let speechText = `${name} no caminho.`;
            if (topObj.class === 'degrau') {
              speechText = 'ATENÇÃO! Degrau à frente!';
            } else if (topObj.class === 'escada') {
              speechText = 'ATENÇÃO! Escada à frente!';
            } else if (topObj.class === 'obstaculo') {
              speechText = 'ATENÇÃO! Obstáculo à frente! Reduza o passo.';
            } else if (isVeryClose) {
              speechText = `ATENÇÃO! ${name} muito perto! Pare!`;
            }

            vibrar(topObj.class === 'escada' || isVeryClose ? [800, 200, 800] : [300, 100, 300]);
            falar(speechText);

            setLastObject(name);
            lastGlobalAlertRef.current = now;
            lastAlertPerClassRef.current[topObj.class] = now;
          }
        }
      }
    } catch { /* silencioso */ }

    if (mountedRef.current) rafRef.current = requestAnimationFrame(detect);
  }, [falar, vibrar]);

  useEffect(() => {
    if (!active) return;
    mountedRef.current = true;

    const loadAndStart = async () => {
      try {
        const loadScript = (src: string) => new Promise<void>((ok, fail) => {
          if (document.querySelector(`script[src="${src}"]`)) { ok(); return; }
          const s = document.createElement('script');
          s.src = src; s.async = true;
          s.onload = () => ok(); s.onerror = () => fail();
          document.head.appendChild(s);
        });

        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');

        const g = window as any;
        if (!g.tf || !g.cocoSsd) throw new Error('Libs não carregaram');
        await g.tf.ready();
        if (!mountedRef.current) return;

        modelRef.current = await g.cocoSsd.load({ base: 'lite_mobilenet_v2' });
        if (!mountedRef.current) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 320, height: 240 }
        });
        if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        setStatus('ready');
        falar('Inteligência artificial pronta. Monitorando obstáculos à frente. Lembre-se: este recurso não substitui o uso de bengala.');
        rafRef.current = requestAnimationFrame(detect);
      } catch {
        if (mountedRef.current) {
          setStatus('error');
          falar('Não foi possível ativar a câmera. Verifique a permissão de acesso.');
        }
      }
    };

    loadAndStart();
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [active, falar, detect]);

  if (!active) return null;

  return (
    <div className="flex flex-col gap-1 w-full" aria-label="Detector de obstáculos pela câmera">
      <div className="relative w-full rounded-2xl overflow-hidden border-4 border-[#FFCC00] bg-black shadow-xl" style={{ minHeight: '180px' }}>
        <video ref={videoRef} className="w-full h-44 object-cover bg-black" muted playsInline autoPlay aria-hidden="true" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
        
        {/* BARRA INFERIOR DE STATUS DA IA */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 px-3 py-2 flex items-center justify-between border-t border-yellow-500/30">
          <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full ${status === 'ready' ? 'bg-green-400 animate-pulse' : status === 'loading' ? 'bg-yellow-400 animate-spin' : 'bg-red-500'}`} />
            <span className={`font-black text-xs sm:text-sm uppercase tracking-wider ${status === 'ready' ? 'text-green-400' : status === 'loading' ? 'text-yellow-400' : 'text-red-400'}`}>
              {status === 'loading' ? 'Carregando IA...' : status === 'ready' ? (lastObject ? `IA: ${lastObject.toUpperCase()}` : 'IA Pronta & Monitorando') : 'Câmera Desativada'}
            </span>
          </div>
          <span className="text-[10px] text-[#FFCC00] font-black uppercase tracking-wider">
            {status === 'ready' ? 'Ativo' : 'Aguardando'}
          </span>
        </div>

        {/* BADGE SUPERIOR */}
        <div className="absolute top-2 left-2 bg-[#FFCC00] text-black px-3 py-1 rounded-full font-black text-xs uppercase shadow-md flex items-center gap-1">
          👁️ Detector de Obstáculos
        </div>
      </div>

      {/* AVISO ÉTICO E DE SEGURANÇA */}
      <p className="text-[11px] text-gray-400 font-bold px-1 text-center" aria-live="polite">
        ⚠️ <span className="text-gray-300">Aviso:</span> Auxílio complementar. Nunca dispense o uso de bengala ou cão-guia.
      </p>
    </div>
  );
}


