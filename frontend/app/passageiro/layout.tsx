import BottomNav from '../components/BottomNav';

export default function PassageiroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh bg-black">
      {/* Container principal com padding bottom para o menu não sobrepor */}
      <div className="flex-1 pb-24 overflow-x-hidden">
        {children}
      </div>
      
      {/* Menu de navegação inferior */}
      <BottomNav />
    </div>
  );
}
