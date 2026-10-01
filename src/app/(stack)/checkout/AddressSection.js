'use client';

import { IoAddCircleOutline, IoCheckmarkCircle, IoLocationOutline } from 'react-icons/io5';
import { useT } from '@/components/Providers';
import { formatPrice } from '@/lib/links';

const label = 'mb-2 text-[13px] font-semibold uppercase tracking-wide text-text-secondary';
const input = 'w-full rounded-xl border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-primary';

const zoneName = (z) => `${z.township}, ${z.city}`;

// Saved addresses as selectable cards, plus "enter a different address"
export default function AddressSection({ zones, addresses, value, onChange, zone }) {
  const t = useT();
  const manual = value.savedId == null;

  const pickSaved = (a) => onChange({ ...value, savedId: a.id, zoneId: a.delivery_zone.id, houseNo: a.house_no ?? '', street: a.street ?? '' });
  const pickManual = () => onChange({ ...value, savedId: null, zoneId: null, houseNo: '', street: '' });

  return (
    <section>
      <p className={label}>{t('delivery_address')}</p>

      {addresses.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {addresses.map(a => {
            const active = value.savedId === a.id;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => pickSaved(a)}
                  aria-pressed={active}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left ${active ? 'border-primary bg-primary-light/40' : 'border-border bg-card'}`}
                >
                  <IoLocationOutline size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span className="flex-1">
                    <span className="block font-medium">
                      {zoneName(a.delivery_zone)}
                      {a.is_default && <span className="ml-2 text-xs font-semibold text-primary">{t('default')}</span>}
                    </span>
                    {(a.house_no || a.street) && (
                      <span className="block text-sm text-text-secondary">{[a.house_no, a.street].filter(Boolean).join(', ')}</span>
                    )}
                  </span>
                  {active && <IoCheckmarkCircle size={22} className="shrink-0 text-primary" />}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={pickManual}
              aria-pressed={manual}
              className={`flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-left font-medium text-primary ${manual ? 'border-primary bg-primary-light/40' : 'border-dashed border-border'}`}
            >
              <IoAddCircleOutline size={20} /> {t('different_address')}
            </button>
          </li>
        </ul>
      )}

      {manual && (
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="zone" className="sr-only">{t('select_zone')}</label>
            <select
              id="zone"
              value={value.zoneId ?? ''}
              onChange={e => onChange({ ...value, zoneId: Number(e.target.value) || null })}
              className={`${input} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat ${value.zoneId ? '' : 'text-placeholder'}`}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 512 512%27%3E%3Cpath fill=%27none%27 stroke=%27%23999%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%2748%27 d=%27M112 184l144 144 144-144%27/%3E%3C/svg%3E")' }}
            >
              <option value="" disabled>{t('select_zone')}</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {zoneName(z)} · {formatPrice(z.delivery_fee)} {t('mmk')}
                </option>
              ))}
            </select>
            {zone && (
              <p className="mt-1.5 text-xs text-text-secondary">
                {t('delivery_fee')}: {formatPrice(zone.delivery_fee)} {t('mmk')}
              </p>
            )}
          </div>

          <input
            value={value.houseNo}
            onChange={e => onChange({ ...value, houseNo: e.target.value })}
            maxLength={100}
            placeholder={t('house_no')}
            autoComplete="address-line1"
            className={input}
          />
          <input
            value={value.street}
            onChange={e => onChange({ ...value, street: e.target.value })}
            maxLength={255}
            placeholder={t('street')}
            autoComplete="address-line2"
            className={input}
          />

          <label className="flex items-center justify-between gap-3 py-1 text-sm">
            {t('save_address')}
            <input
              type="checkbox"
              checked={value.save}
              onChange={e => onChange({ ...value, save: e.target.checked })}
              className="h-5 w-5 accent-[var(--primary)]"
            />
          </label>
        </div>
      )}
    </section>
  );
}
