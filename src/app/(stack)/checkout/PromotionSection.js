'use client';

import { IoCheckmarkCircle, IoGiftOutline } from 'react-icons/io5';
import { useT } from '@/components/Providers';

// Redeem points for a percentage off, like the mobile app's "Use Points"
export default function PromotionSection({ promotions, points, selected, onSelect }) {
  const t = useT();

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">{t('use_points')}</p>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          <IoGiftOutline size={14} /> {t('your_points', { points })}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {promotions.map(promo => {
          const active = selected?.id === promo.id;
          return (
            <button
              key={promo.id}
              type="button"
              onClick={() => onSelect(active ? null : promo)}
              disabled={!promo.can_redeem}
              aria-pressed={active}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left disabled:opacity-50 ${active ? 'border-primary bg-primary-light/40' : 'border-border bg-card'}`}
            >
              <span className="flex-1">
                <span className={`block font-semibold ${active ? 'text-primary' : ''}`}>{promo.name}</span>
                <span className="block text-xs text-text-secondary">{t('points_cost', { points: promo.points_cost })}</span>
              </span>
              {active
                ? <IoCheckmarkCircle size={22} className="text-primary" />
                : !promo.can_redeem && <span className="text-xs text-text-secondary">{t('not_enough_points')}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
