import { IoCheckmarkCircle, IoReceiptOutline } from 'react-icons/io5';
import PageHeader from '@/components/nav/PageHeader';
import SignInPrompt from '@/components/SignInPrompt';
import { getT } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('orders') };
}

// Orders — list to follow the agreed design
export default async function OrdersPage({ searchParams }) {
  const [t, user, { placed }] = await Promise.all([getT(), getCurrentUser(), searchParams]);
  const placedId = Number(placed) || null;

  return (
    <>
      <PageHeader title={t('orders')} />
      {user ? (
        <section className="px-4 py-6 md:px-0">
          {placedId && (
            <div role="status" className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success/10 p-4">
              <IoCheckmarkCircle size={26} className="shrink-0 text-success" />
              <div>
                <p className="font-semibold">{t('order_placed')}</p>
                <p className="text-sm text-text-secondary">{t('order_placed_sub', { id: placedId })}</p>
              </div>
            </div>
          )}
        </section>
      ) : (
        <SignInPrompt Icon={IoReceiptOutline} message={t('sign_in_orders')} next="/orders" />
      )}
    </>
  );
}
