import { IoGiftOutline } from 'react-icons/io5';
import { formatPrice } from '@/lib/links';
import { POINTS_THRESHOLD_MMK } from '@/lib/points';

// "You'll earn N points" — or how the rule works when the order is below 30,000 MMK
export default function PointsHint({ points, t }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-success">
      <IoGiftOutline size={14} className="shrink-0" />
      {points > 0
        ? t(points === 1 ? 'points_will_earn_one' : 'points_will_earn', { points })
        : t('points_rule', { amount: formatPrice(POINTS_THRESHOLD_MMK) })}
    </p>
  );
}
