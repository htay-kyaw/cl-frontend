'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { signInWithGoogle } from '@/app/actions/auth';
import { useLocale, useT } from './Providers';

// Google renders the button; the ID token goes straight to a Server Action,
// which exchanges it with Laravel and stores the session in an httpOnly cookie.
export default function GoogleSignInButton({ redirectTo = '/' }) {
  const t      = useT();
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  const onSuccess = ({ credential }) => {
    setError(null);
    startTransition(async () => {
      const result = await signInWithGoogle(credential);
      if (!result.ok) {
        setError(result.message || t('sign_in_failed'));
        return;
      }
      router.replace(result.needsPhone ? `/phone?next=${encodeURIComponent(redirectTo)}` : redirectTo);
      router.refresh();
    });
  };

  // provider lives here so Google's script only loads on the sign-in page
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <div className="flex flex-col items-center gap-3">
        <div className={pending ? 'pointer-events-none opacity-50' : ''}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => setError(t('sign_in_failed'))}
            shape="pill"
            size="large"
            width="320"
            locale={locale}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </GoogleOAuthProvider>
  );
}
