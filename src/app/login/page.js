import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import BackButton from '@/components/nav/BackButton';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import OpenInBrowser from '@/components/OpenInBrowser';
import { detectInAppBrowser } from '@/lib/in-app-browser';
import { getT } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';
import { safeRedirect } from '@/lib/safe-redirect';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('sign_in') };
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next   = safeRedirect(params.next);
  const [t, user, requestHeaders] = await Promise.all([getT(), getCurrentUser(), headers()]);

  if (user) {
    // already signed in (e.g. in Chrome): go on, keeping a carried-over cart for CartImport
    const target = new URL(next, 'http://x');
    for (const key of ['cart', 'lang']) {
      if (typeof params[key] === 'string') target.searchParams.set(key, params[key]);
    }
    redirect(target.pathname + target.search);
  }

  const { inApp, app, os } = detectInAppBrowser(requestHeaders.get('user-agent') ?? '');

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

        {inApp ? (
          <OpenInBrowser os={os} app={app} next={next} />
        ) : (
          <div className="flex w-full flex-col items-center gap-3">
            <GoogleSignInButton redirectTo={next} />
            {params.error === 'google' && <p className="text-sm text-danger">{t('sign_in_failed')}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
