export default function PontosView() {
  const pontos = [
    { id: '1', nome: 'Praça da Liberdade', lat: '-19.9322', lng: '-43.9378' },
    { id: '2', nome: 'Savassi (Rua Pernambuco)', lat: '-19.9385', lng: '-43.9351' },
    { id: '3', nome: 'Mercado Central', lat: '-19.9231', lng: '-43.9450' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black">Pontos de Ônibus</h2>
        <button className="bg-[#3b82f6] px-6 py-3 rounded-2xl text-sm font-black uppercase shadow-lg shadow-blue-500/20">Adicionar Ponto</button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {pontos.map(p => (
          <div key={p.id} className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-all">
            <div>
              <p className="text-xl font-black">{p.nome}</p>
              <p className="text-xs font-mono text-white/30 mt-1">{p.lat}, {p.lng}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all">✏️</button>
              <button className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition-all">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
