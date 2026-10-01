'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { IoAdd, IoCallOutline, IoStar, IoStarOutline, IoTrashOutline } from 'react-icons/io5';
import { addPhone, makePrimaryPhone, removePhone } from '@/app/actions/profile';
import { useT } from '@/components/Providers';

const MAX_PHONES = 5; // matches PhoneController::MAX_PHONES

export default function PhoneList({ phones }) {
  const t = useT();
  const formRef = useRef(null);
  const [adding, setAdding] = useState(phones.length === 0);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  const [addState, addAction, addPending] = useActionState(async (prev, formData) => {
    const result = await addPhone(prev, formData);
    if (result.ok) {
      formRef.current?.reset();
      setAdding(false);
    }
    return result;
  }, null);

  // primary / delete run one at a time per row
  const runRowAction = (id, action) => startTransition(async () => {
    setBusyId(id);
    setError(null);
    const result = await action(id);
    if (!result.ok) setError(result.message);
    setBusyId(null);
  });

  const remove = (phone) => {
    if (window.confirm(`${t('delete_phone_confirm')}\n${phone.phone}`)) runRowAction(phone.id, removePhone);
  };

  const atLimit = phones.length >= MAX_PHONES;

  return (
    <div className="flex flex-col gap-2">
      {phones.length === 0 && <p className="text-sm text-text-secondary">{t('no_phones')}</p>}

      <ul className="flex flex-col gap-2">
        {phones.map(phone => (
          <li
            key={phone.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${phone.is_primary ? 'border-primary bg-primary-light/40' : 'border-border'} ${busyId === phone.id ? 'opacity-50' : ''}`}
          >
            <IoCallOutline size={18} className="shrink-0 text-primary" />
            <span className="flex-1 truncate font-medium">{phone.phone}</span>

            {phone.is_primary ? (
              <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                <IoStar size={11} /> {t('primary')}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => runRowAction(phone.id, makePrimaryPhone)}
                disabled={busyId !== null}
                aria-label={t('set_primary')}
                title={t('set_primary')}
                className="rounded-full p-1.5 text-text-secondary hover:text-primary"
              >
                <IoStarOutline size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={() => remove(phone)}
              disabled={busyId !== null}
              aria-label={t('delete_phone')}
              title={t('delete_phone')}
              className="rounded-full p-1.5 text-text-secondary hover:text-danger"
            >
              <IoTrashOutline size={18} />
            </button>
          </li>
        ))}
      </ul>

      {phones.length > 1 && <p className="text-xs text-text-secondary">{t('primary_phone_hint')}</p>}
      {error && <p className="text-sm text-danger">{error}</p>}

      {adding ? (
        <form ref={formRef} action={addAction} className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              maxLength={20}
              autoFocus={phones.length > 0}
              placeholder={t('phone_placeholder')}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[15px] outline-none focus:border-primary"
            />
            <button type="submit" disabled={addPending} className="rounded-lg bg-primary px-3.5 text-sm font-semibold text-white disabled:opacity-50">
              {addPending ? '...' : t('save')}
            </button>
            {phones.length > 0 && (
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg px-2 text-sm text-text-secondary">
                {t('cancel')}
              </button>
            )}
          </div>
          {addState && !addState.ok && <p className="text-sm text-danger">{addState.message}</p>}
        </form>
      ) : atLimit ? (
        <p className="text-xs text-text-secondary">{t('phone_limit', { max: MAX_PHONES })}</p>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary py-2.5 text-sm font-semibold text-primary"
        >
          <IoAdd size={18} /> {t('add_phone')}
        </button>
      )}
    </div>
  );
}
