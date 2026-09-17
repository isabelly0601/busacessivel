"use client";

import { Home, Bus, Mic, Bell, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, label: 'Início', path: '/passageiro' },
    { icon: Bus, label: 'Linhas', path: '/passageiro/linhas' },
    { icon: Mic, label: '', path: '/passageiro/voz', isMain: true },
    { icon: Bell, label: 'Alertas', path: '/passageiro/alertas' },
    { icon: Settings, label: 'Config.', path: '/passageiro/config' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t-2 border-[#222] pb-safe z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      <div className="flex justify-around items-end h-24 px-2 pb-4 relative">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#FFCC00] rounded-full flex flex-col items-center justify-center border-8 border-[#0a0a0a] shadow-[0_0_20px_rgba(255,204,0,0.3)] active:scale-95 transition-transform"
                aria-label="Pesquisa por voz"
              >
                <Icon size={32} color="#000" strokeWidth={3} />
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center w-16 gap-1 ${
                isActive ? 'text-[#FFCC00]' : 'text-gray-500'
              } active:scale-95 transition-transform`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={26} strokeWidth={isActive ? 3 : 2} />
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-[#FFCC00]' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
