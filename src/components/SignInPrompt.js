import Link from 'next/link';
import EmptyState from './EmptyState';
import { getT } from '@/lib/preferences';

// Shown on tabs that need an account when the visitor is browsing as a guest
export default async function SignInPrompt({ Icon, message, next }) {
  const t = await getT();

  return (
    <EmptyState Icon={Icon} title={message}>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white"
      >
        {t('sign_in')}
      </Link>
    </EmptyState>
  );
}
