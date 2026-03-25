"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Frota', href: '/admin/frota' },
    { name: 'Pontos', href: '/admin/pontos' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="p-6 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-black text-[#3b82f6]">Admin <span className="text-white">PontoMB</span></h1>
      </header>

      <nav className="bg-[#111] border-b border-white/5">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 min-w-[120px] py-4 px-6 text-center text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                  isActive 
                    ? 'text-[#3b82f6] border-[#3b82f6] bg-[#3b82f6]/5' 
                    : 'text-white/40 border-transparent hover:text-white/60'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
