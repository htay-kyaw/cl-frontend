import { IoReceiptOutline } from 'react-icons/io5';
import PageHeader from '@/components/nav/PageHeader';
import SignInPrompt from '@/components/SignInPrompt';
import { getT } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('orders') };
}

// Orders — list to follow the agreed design
export default async function OrdersPage() {
  const [t, user] = await Promise.all([getT(), getCurrentUser()]);

  return (
    <>
      <PageHeader title={t('orders')} />
      {user ? (
        <section className="px-4 py-6 md:px-0" />
      ) : (
        <SignInPrompt Icon={IoReceiptOutline} message={t('sign_in_orders')} next="/orders" />
      )}
    </>
  );
}
