export default function DashboardView() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black">Dashboard Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5">
          <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Passageiros Ativos</p>
          <p className="text-5xl font-black mt-2">12</p>
        </div>
        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5">
          <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Ônibus em Rota</p>
          <p className="text-5xl font-black mt-2 text-[#f59e0b]">8</p>
        </div>
        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5">
          <p className="text-white/40 font-bold uppercase text-xs tracking-widest">Alertas Hoje</p>
          <p className="text-5xl font-black mt-2 text-blue-500">145</p>
        </div>
      </div>
      
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 h-64 flex items-center justify-center">
        <p className="text-white/20 font-bold italic">Gráfico de atividade em tempo real em breve...</p>
      </div>
    </div>
  );
}
