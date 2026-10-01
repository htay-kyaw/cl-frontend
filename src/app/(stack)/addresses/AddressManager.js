'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { IoAdd, IoClose, IoLocationOutline, IoPencilOutline, IoStarOutline, IoTrashOutline } from 'react-icons/io5';
import { deleteAddress, makeDefaultAddress, saveAddress } from '@/app/actions/addresses';
import EmptyState from '@/components/EmptyState';
import { useT } from '@/components/Providers';
import ZoneSelect, { zoneName } from '@/components/ZoneSelect';

const MAX_ADDRESSES = 10; // matches AddressController::MAX_ADDRESSES
const input = 'w-full rounded-xl border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-primary';

export default function AddressManager({ addresses, zones }) {
  const t = useT();
  const dialogRef = useRef(null);
  const [editing, setEditing] = useState(null); // address being edited, or {} for a new one
  const [zoneId, setZoneId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  const [formState, formAction, saving] = useActionState(async (prev, formData) => {
    const result = await saveAddress(prev, formData);
    if (result.ok) dialogRef.current?.close();
    return result;
  }, null);

  const open = (address) => {
    setEditing(address ?? {});
    setZoneId(address?.delivery_zone?.id ?? null);
    dialogRef.current?.showModal();
  };

  const rowAction = (id, action) => startTransition(async () => {
    setBusyId(id);
    setError(null);
    const result = await action(id);
    if (!result.ok) setError(result.message);
    setBusyId(null);
  });

  const remove = (a) => {
    if (window.confirm(`${t('delete_address_confirm')}\n${zoneName(a.delivery_zone)}`)) rowAction(a.id, deleteAddress);
  };

  const isNew = editing && !editing.id;
  const action = 'flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold disabled:opacity-40';

  return (
    <div className="flex flex-col gap-3 p-4 md:px-0">
      {error && <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {addresses.length === 0 ? (
        <EmptyState Icon={IoLocationOutline} title={t('no_addresses')} subtitle={t('no_addresses_sub')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map(a => (
            <li key={a.id} className={`rounded-xl border bg-card p-4 ${a.is_default ? 'border-primary' : 'border-border'} ${busyId === a.id ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <IoLocationOutline size={20} className="mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {a.delivery_zone ? zoneName(a.delivery_zone) : '—'}
                    {a.is_default && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">{t('default')}</span>}
                  </p>
                  {(a.house_no || a.street) && <p className="text-sm text-text-secondary">{[a.house_no, a.street].filter(Boolean).join(', ')}</p>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1 border-t border-border/60 pt-2">
                <button type="button" onClick={() => open(a)} disabled={busyId !== null} className={`${action} text-primary`}>
                  <IoPencilOutline size={15} /> {t('edit')}
                </button>
                {!a.is_default && (
                  <button type="button" onClick={() => rowAction(a.id, makeDefaultAddress)} disabled={busyId !== null} className={`${action} text-primary`}>
                    <IoStarOutline size={15} /> {t('set_default')}
                  </button>
                )}
                <button type="button" onClick={() => remove(a)} disabled={busyId !== null} className={`${action} ml-auto text-danger`}>
                  <IoTrashOutline size={15} /> {t('remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {addresses.length < MAX_ADDRESSES ? (
        <button
          type="button"
          onClick={() => open(null)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary py-3 font-semibold text-primary"
        >
          <IoAdd size={20} /> {t('add_address')}
        </button>
      ) : (
        <p className="text-center text-xs text-text-secondary">{t('address_limit', { max: MAX_ADDRESSES })}</p>
      )}

      <dialog
        ref={dialogRef}
        onClick={e => e.target === dialogRef.current && dialogRef.current.close()}
        className="m-0 mt-auto w-full max-w-none rounded-t-2xl bg-background p-0 text-text backdrop:bg-black/50 md:m-auto md:max-w-md md:rounded-2xl"
      >
        {editing && (
          // keyed so each open starts from that address's values
          <form key={editing.id ?? 'new'} action={formAction} className="flex flex-col gap-3 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-bold">{isNew ? t('add_address') : t('edit_address')}</h2>
              <button type="button" onClick={() => dialogRef.current.close()} aria-label={t('close')} className="p-1">
                <IoClose size={24} />
              </button>
            </div>

            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <ZoneSelect id="address-zone" name="delivery_zone_id" zones={zones} value={zoneId} onChange={setZoneId} required />
            <input name="house_no" defaultValue={editing.house_no ?? ''} maxLength={100} placeholder={t('house_no')} autoComplete="address-line1" className={input} />
            <input name="street" defaultValue={editing.street ?? ''} maxLength={255} placeholder={t('street')} autoComplete="address-line2" className={input} />

            {!editing.is_default && (
              <label className="flex items-center justify-between gap-3 py-1 text-sm">
                {t('set_default')}
                <input
                  type="checkbox"
                  name="is_default"
                  defaultChecked={addresses.length === 0}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
              </label>
            )}

            {formState && !formState.ok && <p className="text-sm text-danger">{formState.message}</p>}

            <button type="submit" disabled={saving || !zoneId} className="mt-1 h-12 rounded-xl bg-primary font-bold text-white disabled:opacity-50">
              {saving ? t('saving') : t('save')}
            </button>
          </form>
        )}
      </dialog>
    </div>
  );
}
