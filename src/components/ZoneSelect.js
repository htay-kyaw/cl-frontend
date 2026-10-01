'use client';

import { useT } from './Providers';
import { formatPrice } from '@/lib/links';

export const zoneName = (z) => `${z.township}, ${z.city}`;

// Native select (the OS picker is the best UX on phones) showing each zone's delivery fee
export default function ZoneSelect({ id = 'zone', name, zones, value, onChange, required = false }) {
  const t = useT();

  return (
    <>
      <label htmlFor={id} className="sr-only">{t('select_zone')}</label>
      <select
        id={id}
        name={name}
        required={required}
        value={value ?? ''}
        onChange={e => onChange?.(Number(e.target.value) || null)}
        className={`w-full appearance-none rounded-xl border border-border bg-card bg-[length:16px] bg-[right_1rem_center] bg-no-repeat px-4 py-3 text-[15px] outline-none focus:border-primary ${value ? '' : 'text-placeholder'}`}
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 512 512%27%3E%3Cpath fill=%27none%27 stroke=%27%23999%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%2748%27 d=%27M112 184l144 144 144-144%27/%3E%3C/svg%3E")' }}
      >
        <option value="" disabled>{t('select_zone')}</option>
        {zones.map(z => (
          <option key={z.id} value={z.id}>
            {zoneName(z)} · {formatPrice(z.delivery_fee)} {t('mmk')}
          </option>
        ))}
      </select>
    </>
  );
}
