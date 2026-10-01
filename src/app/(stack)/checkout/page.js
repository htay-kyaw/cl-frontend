import { redirect } from 'next/navigation';
import PageHeader from '@/components/nav/PageHeader';
import { addressApi, bankApi, deliveryApi, loyaltyApi } from '@/lib/api';
import { getT } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';
import CheckoutForm from './CheckoutForm';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('checkout') };
}

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent('/checkout')}`);
  if (!user.phone) redirect(`/phone?next=${encodeURIComponent('/checkout')}`);

  const [t, zones, banks, promotions, addresses] = await Promise.all([
    getT(), deliveryApi.zones(), bankApi.list(), loyaltyApi.promotions(), addressApi.list(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title={t('checkout')} back cart={false} />
      <CheckoutForm
        zones={zones}
        banks={banks}
        promotions={promotions}
        addresses={addresses}
        phone={user.phone}
        points={user.points ?? 0}
      />
    </div>
  );
}
