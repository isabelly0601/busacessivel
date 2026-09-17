"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Volume2, ArrowLeft, Bus } from "lucide-react";

type RequestStatus = "AGUARDANDO" | "NOTIFICADO" | "EMBARCADO" | "CANCELADO" | null;

export default function MapaAguardandoPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<RequestStatus>(null);
  const [loading, setLoading] = useState(true);
  const lastStatus = useRef<string | null>(null);

  const falar = (texto: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(texto);
      utter.lang = "pt-BR";
      utter.rate = 0.92;
      window.speechSynthesis.speak(utter);
    }
  };

  const vibrar = (pattern: number[]) => {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  };

  useEffect(() => {
    if (!requestId) return;

    // Instrucao inicial por voz ao abrir a pagina
    falar(
      "Parada solicitada com sucesso. Aguarde na area do ponto de onibus. Voce sera avisado por voz e vibracoes quando o onibus estiver proximo."
    );

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/boarding/${requestId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        const newStatus: RequestStatus = data.status;
        setStatus(newStatus);
        setLoading(false);

        // Aviso de voz apenas quando o status muda
        if (newStatus !== lastStatus.current) {
          if (newStatus === "NOTIFICADO") {
            falar(
              "Atencao! O onibus esta se aproximando agora. Fique proximo da calcada e prepare-se para embarcar."
            );
            vibrar([300, 100, 300, 100, 300]);
          } else if (newStatus === "EMBARCADO") {
            falar("Voce embarcou com sucesso. Boa viagem!");
            vibrar([500]);
          }
          lastStatus.current = newStatus;
        }
      } catch (e) {
        console.error("Erro ao buscar status:", e);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const isNotificado = status === "NOTIFICADO";
  const isEmbarcado = status === "EMBARCADO";

  const statusEmoji = isNotificado ? "🚌" : isEmbarcado ? "✅" : "⏳";
  const statusLabel = isNotificado
    ? "Onibus proximo!"
    : isEmbarcado
    ? "Embarcado!"
    : "Aguardando...";
  const statusColor = isNotificado
    ? "text-green-400"
    : isEmbarcado
    ? "text-blue-400"
    : "text-yellow-400";
  const statusMsg = isNotificado
    ? "O motorista sinalizou que esta se aproximando. Fique proximo da calcada e prepare-se para embarcar!"
    : isEmbarcado
    ? "Voce ja embarcou. Boa viagem!"
    : "Sua solicitacao esta registrada. O motorista confirmara a chegada em breve.";

  const falarStatus = () => {
    falar(
      isNotificado
        ? "O onibus esta proximo! Prepare-se para embarcar."
        : isEmbarcado
        ? "Voce ja embarcou. Boa viagem!"
        : "Ainda aguardando a chegada do onibus."
    );
  };

  return (
    <main className="min-h-dvh flex flex-col bg-[#000] text-white">

      {/* HEADER */}
      <header className="flex justify-between items-center p-6 pt-10">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center active:bg-[#333]"
          aria-label="Voltar"
        >
          <ArrowLeft color="#FFCC00" size={24} />
        </button>
        <h1 className="text-lg font-black uppercase tracking-widest">Mapa do Onibus</h1>
        <button
          onClick={falarStatus}
          className="w-12 h-12 bg-[#FFCC00] rounded-full flex items-center justify-center active:bg-[#E6B800]"
          aria-label="Ouvir status atual"
        >
          <Volume2 color="#000" size={24} strokeWidth={3} />
        </button>
      </header>

      {/* AREA DO MAPA */}
      <div className="flex-1 mx-4 rounded-[2rem] overflow-hidden relative bg-[#111] border-4 border-[#222] flex items-center justify-center min-h-[300px]">
        <div className="text-center px-8">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-gray-500 text-sm">
            Posicao em tempo real do onibus sera exibida aqui.
          </p>
        </div>

        {/* Indicador animado quando o onibus esta chegando */}
        {isNotificado && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_40px_rgba(34,197,94,0.9)]">
              <Bus color="#000" size={40} />
            </div>
            <span className="text-green-400 font-black text-base uppercase tracking-widest animate-pulse">
              Onibus Chegando!
            </span>
          </div>
        )}

        {isEmbarcado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <div className="text-8xl mb-4">✅</div>
              <p className="text-white font-black text-2xl">Embarcado!</p>
            </div>
          </div>
        )}
      </div>

      {/* CARD DE STATUS */}
      <div className="m-4 bg-[#111] rounded-[2rem] border-4 border-[#222] p-6 flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="animate-spin text-[#FFCC00]" size={36} />
            <span className="text-gray-400 text-lg">Verificando status...</span>
          </div>
        ) : (
          <>
            <div className={`text-4xl font-black ${statusColor}`}>
              {statusEmoji} {statusLabel}
            </div>
            <p className="text-gray-400 text-base">{statusMsg}</p>
          </>
        )}

        {/* Botao de voz grande para acessibilidade */}
        <button
          onClick={falarStatus}
          className="w-full bg-[#FFCC00] text-[#000] font-black text-xl py-5 rounded-[2rem] flex justify-center items-center gap-3 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,204,0,0.3)] mt-2"
          aria-label="Ouvir status atual por voz"
        >
          <Volume2 fill="#000" size={28} /> Ouvir Status
        </button>
      </div>
    </main>
  );
}