'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  User,
  Target,
  FileText,
  TreePine,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: '我的档案', icon: User },
  { href: '/match', label: 'JD 匹配', icon: Target },
  { href: '/generate', label: '生成简历', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-border/50 glass-panel relative flex flex-col flex-shrink-0">
      {/* Cyan gradient line on right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border/50">
        <TreePine className="h-5 w-5 text-primary drop-shadow-[0_0_6px_hsl(195_100%_50%/0.8)]" />
        <span className="font-semibold text-sm tracking-tight">darkforest</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border',
                isActive
                  ? 'bg-primary/10 text-primary border-primary/30 glow-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 flex-shrink-0',
                  isActive && 'drop-shadow-[0_0_4px_hsl(195_100%_50%/0.9)]'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">v0.1.0</p>
      </div>
    </aside>
  );
}
