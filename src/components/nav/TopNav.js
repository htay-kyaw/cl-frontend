'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CartButton from '../CartButton';
import { useT } from '../Providers';
import { TABS, isActive } from './tabs';

// Desktop navigation — the same tabs move into a top bar from md up
export default function TopNav() {
  const t        = useT();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-background/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="text-lg font-bold text-primary">Eichit Cosmetics</Link>
        <nav className="flex flex-1 items-center gap-1">
          {TABS.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${active ? 'bg-primary-light text-primary' : 'text-text-secondary hover:bg-surface'}`}
              >
                <Icon size={18} />
                {t(label)}
              </Link>
            );
          })}
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
