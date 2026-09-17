"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface ObstacleDetectorProps {
  falar: (texto: string) => void;
  vibrar: (ms: number | number[]) => void;
  active: boolean;
}

const CLASS_PT: Record<string, string> = {
  'person': 'pessoa', 'car': 'carro', 'truck': 'caminhão',
  'bus': 'ônibus', 'motorcycle': 'moto', 'bicycle': 'bicicleta',
  'dog': 'cachorro', 'cat': 'gato', 'bench': 'banco',
  'chair': 'cadeira', 'fire hydrant': 'hidrante', 'backpack': 'mochila',
};

const DANGER_CLASSES = Object.keys(CLASS_PT);

export default function ObstacleDetector({ falar, vibrar, active }: ObstacleDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastAlertRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lastObject, setLastObject] = useState('');

  // Detecção contínua
  const detect = useCallback(async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) { rafRef.current = requestAnimationFrame(detect); return; }

    try {
      const preds = await modelRef.current.detect(video);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const now = Date.now();
        const found = preds.filter((p: any) => DANGER_CLASSES.includes(p.class) && p.score > 0.5);

        if (found.length > 0 && now - lastAlertRef.current > 4000) {
          const obj = found[0];
          const name = CLASS_PT[obj.class] || obj.class;
          const area = (obj.bbox[2] * obj.bbox[3]) / (canvasRef.current.width * canvasRef.current.height);
          
          if (area > 0.2) {
            vibrar([800, 200, 800]);
            falar(`ATENÇÃO! ${name} muito perto! Pare!`);
          } else {
            vibrar([300, 100, 300]);
            falar(`${name} no caminho.`);
          }
          setLastObject(name);
          lastAlertRef.current = now;

          // Desenha box
          found.forEach((p: any) => {
            const [x, y, w, h] = p.bbox;
            ctx.strokeStyle = area > 0.2 ? '#ef4444' : '#f59e0b';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);
          });
        }
      }
    } catch (e) { /* silencioso */ }

    if (mountedRef.current) rafRef.current = requestAnimationFrame(detect);
  }, [falar, vibrar]);

  useEffect(() => {
    if (!active) return;
    mountedRef.current = true;

    const loadAndStart = async () => {
      try {
        // Carrega TF.js e COCO-SSD via tags <script> globais
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
        falar('Detector de obstáculos ligado.');
        rafRef.current = requestAnimationFrame(detect);
      } catch {
        if (mountedRef.current) setStatus('error');
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
    <div className="relative w-full rounded-2xl overflow-hidden border-4 border-yellow-500" style={{minHeight: '160px'}}>
      <video ref={videoRef} className="w-full h-40 object-cover bg-black" muted playsInline autoPlay />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-3 py-2 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${status === 'ready' ? 'bg-green-400 animate-pulse' : status === 'loading' ? 'bg-yellow-400 animate-spin' : 'bg-red-500'}`} />
        <span className={`font-black text-sm uppercase ${status === 'ready' ? 'text-green-400' : status === 'loading' ? 'text-yellow-400' : 'text-red-400'}`}>
          {status === 'loading' ? 'Carregando IA...' : status === 'ready' ? (lastObject ? `IA: ${lastObject}` : 'IA Monitorando') : 'Câmera off'}
        </span>
      </div>
      <div className="absolute top-2 left-2 bg-yellow-500 text-black px-3 py-1 rounded-full font-black text-xs uppercase">
        ⚠️ Detector
      </div>
    </div>
  );
}
