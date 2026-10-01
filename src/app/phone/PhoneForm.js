'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addPhone } from '@/app/actions/profile';
import { useT } from '@/components/Providers';

export default function PhoneForm({ next }) {
  const t      = useT();
  const router = useRouter();
  const [state, action, pending] = useActionState(addPhone, null);

  useEffect(() => {
    if (state?.ok) router.replace(next);
  }, [state, next, router]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        maxLength={20}
        placeholder={t('phone_placeholder')}
        className="rounded-xl border border-border bg-surface px-4 py-3.5 text-base outline-none focus:border-primary"
      />
      {state && !state.ok && <p className="text-sm text-danger">{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-xl bg-primary py-3.5 font-semibold text-white disabled:opacity-50">
        {pending ? t('saving') : t('continue')}
      </button>
    </form>
  );
}
