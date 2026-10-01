'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IoArchiveOutline, IoArrowUndoOutline, IoClose, IoReturnDownBackOutline } from 'react-icons/io5';
import { archiveOrder, cancelOrder, requestReturn, unarchiveOrder } from '@/app/actions/orders';
import { useT } from '@/components/Providers';

const REASONS = ['damaged', 'wrong_item', 'changed_mind', 'other'];

export default function OrderActions({ id, canCancel, canReturn, canArchive, canUnarchive }) {
  const t = useT();
  const router = useRouter();
  const dialogRef = useRef(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState('');

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

  const submitReturn = (e) => {
    e.preventDefault();
    if (!reason) return;
    run(() => requestReturn(id, reason, note), () => {
      dialogRef.current?.close();
      setNotice(t('return_submitted'));
    });
  };

  if (!canCancel && !canReturn && !canArchive && !canUnarchive && !notice && !error) return null;

  const outline = 'flex items-center justify-center gap-2 rounded-xl border-[1.5px] py-3.5 font-semibold disabled:opacity-50';

  return (
    <div className="flex flex-col gap-3">
      {notice && <p role="status" className="rounded-xl bg-success/10 p-3 text-sm text-success">{notice}</p>}
      {error && <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {canCancel && (
        <button type="button" onClick={cancel} disabled={pending} className={`${outline} border-danger text-danger`}>
          {t('cancel_order')}
        </button>
      )}

      {canReturn && (
        <button type="button" onClick={() => dialogRef.current?.showModal()} disabled={pending} className={`${outline} border-warning text-warning`}>
          <IoReturnDownBackOutline size={18} /> {t('request_return')}
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

      {canReturn && (
        <dialog
          ref={dialogRef}
          onClick={e => e.target === dialogRef.current && dialogRef.current.close()}
          className="m-0 mt-auto w-full max-w-none rounded-t-2xl bg-background p-0 text-text backdrop:bg-black/50 md:m-auto md:max-w-md md:rounded-2xl"
        >
          <form onSubmit={submitReturn} className="flex flex-col gap-4 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('request_return')}</h2>
              <button type="button" onClick={() => dialogRef.current.close()} aria-label={t('close')} className="p-1">
                <IoClose size={24} />
              </button>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm text-text-secondary">{t('return_select_reason')}</legend>
              {REASONS.map(r => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${reason === r ? 'border-primary bg-primary-light/40' : 'border-border'}`}
                >
                  <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-[var(--primary)]" />
                  {t(`reason_${r}`)}
                </label>
              ))}
            </fieldset>

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={t('return_note_placeholder')}
              className="rounded-xl border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-primary"
            />

            <button type="submit" disabled={!reason || pending} className="h-12 rounded-xl bg-primary font-bold text-white disabled:opacity-50">
              {t('submit')}
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
