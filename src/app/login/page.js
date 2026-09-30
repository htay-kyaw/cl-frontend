import { redirect } from 'next/navigation';
import BackButton from '@/components/nav/BackButton';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { getT } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';
import { safeRedirect } from '@/lib/safe-redirect';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('sign_in') };
}

export default async function LoginPage({ searchParams }) {
  const next = safeRedirect((await searchParams).next);
  const [t, user] = await Promise.all([getT(), getCurrentUser()]);

  if (user) redirect(next);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4">
      <div className="py-2">
        <BackButton />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-4xl font-bold text-white">E</div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t('sign_in_welcome')}</h1>
          <p className="text-sm text-text-secondary">{t('sign_in_sub')}</p>
        </div>
        <GoogleSignInButton redirectTo={next} />
      </div>
    </main>
  );
}
