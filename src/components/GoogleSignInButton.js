'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { signInWithGoogle } from '@/app/actions/auth';

// Google renders the button; the ID token goes straight to a Server Action,
// which exchanges it with Laravel and stores the session in an httpOnly cookie.
export default function GoogleSignInButton({ redirectTo = '/' }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  const onSuccess = ({ credential }) => {
    setError(null);
    startTransition(async () => {
      const result = await signInWithGoogle(credential);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace(result.needsPhone ? `/phone?next=${encodeURIComponent(redirectTo)}` : redirectTo);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={pending ? 'pointer-events-none opacity-50' : ''}>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => setError('Google sign-in was cancelled or failed.')}
          shape="pill"
          size="large"
          width="320"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
