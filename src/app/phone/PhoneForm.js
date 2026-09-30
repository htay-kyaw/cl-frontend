'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { savePhone } from '@/app/actions/auth';

export default function PhoneForm({ next }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(savePhone, null);

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
        placeholder="09xxxxxxxxx"
        className="rounded-lg border px-4 py-3"
      />
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-pink-600 px-4 py-3 font-medium text-white disabled:opacity-50">
        {pending ? 'Saving…' : 'Continue'}
      </button>
    </form>
  );
}
