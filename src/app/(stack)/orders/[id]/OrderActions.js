'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IoArchiveOutline, IoArrowUndoOutline } from 'react-icons/io5';
import { archiveOrder, cancelOrder, unarchiveOrder } from '@/app/actions/orders';
import { useT } from '@/components/Providers';

export default function OrderActions({ id, canCancel, canArchive, canUnarchive }) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const run = (action, after) => startTransition(async () => {
    setError(null);
    const result = await action();
    if (!result.ok) {
      setError(result.message);
      return;
    }
    after?.();
  });

  const cancel = () => {
    if (window.confirm(t('cancel_confirm'))) run(() => cancelOrder(id));
  };

  if (!canCancel && !canArchive && !canUnarchive && !error) return null;

  const outline = 'flex items-center justify-center gap-2 rounded-xl border-[1.5px] py-3.5 font-semibold disabled:opacity-50';

  return (
    <div className="flex flex-col gap-3">
      {error && <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {canCancel && (
        <button type="button" onClick={cancel} disabled={pending} className={`${outline} border-danger text-danger`}>
          {t('cancel_order')}
        </button>
      )}

      {canArchive && (
        <button
          type="button"
          onClick={() => run(() => archiveOrder(id), () => router.push('/orders?tab=archived'))}
          disabled={pending}
          className={`${outline} border-border text-text-secondary`}
        >
          <IoArchiveOutline size={18} /> {t('archive')}
        </button>
      )}

      {canUnarchive && (
        <button type="button" onClick={() => run(() => unarchiveOrder(id))} disabled={pending} className={`${outline} border-border text-text-secondary`}>
          <IoArrowUndoOutline size={18} /> {t('unarchive')}
        </button>
      )}
    </div>
  );
}
