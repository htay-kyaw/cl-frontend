import { redirect } from 'next/navigation';
import { IoCallOutline } from 'react-icons/io5';
import PhoneForm from './PhoneForm';
import { getT } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';
import { safeRedirect } from '@/lib/safe-redirect';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('enter_phone') };
}

export default async function PhonePage({ searchParams }) {
  const next = safeRedirect((await searchParams).next);
  const [t, user] = await Promise.all([getT(), getCurrentUser()]);

  if (!user) redirect(`/login?next=${encodeURIComponent(`/phone?next=${next}`)}`);
  if (user.phone) redirect(next);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 pb-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <IoCallOutline size={30} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('enter_phone')}</h1>
        <p className="text-sm text-text-secondary">{t('phone_reason')}</p>
      </div>
      <PhoneForm next={next} />
    </main>
  );
}
