import { redirect } from 'next/navigation';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { getCurrentUser } from '@/lib/session';
import { safeRedirect } from '@/lib/safe-redirect';

export const metadata = { title: 'Sign in' };

// Functional placeholder — final UI to follow the mobile app's design
export default async function LoginPage({ searchParams }) {
  const next = safeRedirect((await searchParams).next);

  if (await getCurrentUser()) redirect(next);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <GoogleSignInButton redirectTo={next} />
    </main>
  );
}
