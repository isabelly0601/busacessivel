"use client";

import { useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';

interface DigitalTicketProps {
  solicitacaoId: string;
  linha: string;
  ponto: string;
}

export default function DigitalTicket({ solicitacaoId, linha, ponto }: DigitalTicketProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, solicitacaoId, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 40,
        displayValue: false
      });
    }
  }, [solicitacaoId]);

  const ticketData = JSON.stringify({
    id: solicitacaoId,
    linha,
    ponto,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="bg-white text-black p-8 rounded-[40px] flex flex-col items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
      <div className="flex flex-col items-center gap-1 border-b border-black/10 pb-4 w-full">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Ticket de Embarque</span>
        <h2 className="text-4xl font-black">{linha}</h2>
      </div>

      <div className="p-4 bg-white rounded-3xl border-4 border-black/5">
        <QRCodeSVG 
          value={ticketData} 
          size={180}
          level="H"
          includeMargin={true}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <svg ref={barcodeRef}></svg>
        <code className="text-[8px] font-mono font-bold tracking-[0.2em] opacity-30">{solicitacaoId}</code>
      </div>

      <div className="text-center space-y-1">
        <p className="text-[12px] font-bold opacity-60 uppercase">Ponto de Embarque</p>
        <p className="text-sm font-black w-48 leading-tight">{ponto}</p>
      </div>

      <div className="w-full bg-black/5 py-3 rounded-2xl flex flex-col items-center gap-1">
        <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Validado via BusAcessível</span>
      </div>

      <div className="w-full h-4 flex justify-between px-2 opacity-20">
         {[...Array(12)].map((_, i) => (
           <div key={i} className="w-1 h-full bg-black rounded-full" />
         ))}
      </div>
    </div>
  );
}
