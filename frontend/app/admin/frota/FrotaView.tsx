"use client";

import * as XLSX from 'xlsx';

export default function FrotaView() {
  const frota = [
    { id: '1', linha: '340', placa: 'HKW-4490', status: 'Em Rota' },
    { id: '2', linha: '51-A', placa: 'GXV-1244', status: 'Em Rota' },
    { id: '3', linha: '82', placa: 'OLP-0912', status: 'Garagem' },
  ];

  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(frota);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Frota");
    XLSX.writeFile(workbook, "frota_busacessivel.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-black">Gerenciamento de Frota</h2>
        <button 
          onClick={exportarExcel}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <span>📥</span> Exportar Excel
        </button>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr>
              <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Linha</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Placa</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest text-white/40">Status</th>
              <th className="p-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {frota.map(v => (
              <tr key={v.id} className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-black text-xl text-[#f59e0b]">{v.linha}</td>
                <td className="p-6 font-mono text-white/70">{v.placa}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    v.status === 'Em Rota' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-white/10 text-white/40'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button className="text-xs font-bold text-white/40 uppercase hover:text-white">Gerenciar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
