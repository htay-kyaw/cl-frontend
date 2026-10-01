import PageHeader from '@/components/nav/PageHeader';
import { getT } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';
import CartView from './CartView';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('cart') };
}

export default async function CartPage() {
  const [t, user] = await Promise.all([getT(), getCurrentUser()]);

  // guests sign in first; Google accounts add a phone before their first order
  const checkoutHref = !user
    ? `/login?next=${encodeURIComponent('/checkout')}`
    : !user.phone
      ? `/phone?next=${encodeURIComponent('/checkout')}`
      : '/checkout';

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title={t('cart')} back cart={false} />
      <CartView checkoutHref={checkoutHref} />
    </div>
  );
}
