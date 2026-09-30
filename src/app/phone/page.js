import { redirect } from 'next/navigation';
import PhoneForm from './PhoneForm';
import { getCurrentUser } from '@/lib/session';
import { safeRedirect } from '@/lib/safe-redirect';

export const metadata = { title: 'Add phone number' };

// Functional placeholder — final UI to follow the mobile app's design
export default async function PhonePage({ searchParams }) {
  const next = safeRedirect((await searchParams).next);
  const user = await getCurrentUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(`/phone?next=${next}`)}`);
  if (user.phone) redirect(next);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Add your phone number</h1>
      <p className="text-sm text-gray-600">We need it to contact you about delivery.</p>
      <PhoneForm next={next} />
    </main>
  );
}
