'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  Code, 
  Search, 
  Brain 
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/code', icon: Code, label: 'Code' },
  { href: '/research', icon: Search, label: 'Research' },
  { href: '/extraction', icon: Brain, label: 'Extract' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/50 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                min-w-[60px] h-12 px-2 py-1 rounded-lg
                transition-all duration-200
                active:scale-95
                ${isActive 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }
              `}
            >
              <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-blue-400' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-blue-400' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
