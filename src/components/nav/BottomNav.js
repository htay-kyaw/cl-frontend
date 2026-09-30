'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '../Providers';
import { TABS, isActive } from './tabs';

// Mobile tab bar — hidden from md up, where TopNav takes over
export default function BottomNav() {
  const t        = useT();
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${active ? 'text-primary' : 'text-text-secondary'}`}
              >
                <Icon size={24} />
                <span className="leading-none">{t(label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
