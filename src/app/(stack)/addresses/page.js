import { redirect } from 'next/navigation';
import PageHeader from '@/components/nav/PageHeader';
import { addressApi, deliveryApi } from '@/lib/api';
import { getT } from '@/lib/preferences';
import { getToken } from '@/lib/session';
import AddressManager from './AddressManager';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('my_addresses') };
}

export default async function AddressesPage() {
  if (!(await getToken())) redirect(`/login?next=${encodeURIComponent('/addresses')}`);

  const [t, addresses, zones] = await Promise.all([getT(), addressApi.list(), deliveryApi.zones()]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title={t('my_addresses')} back cart={false} />
      <AddressManager addresses={addresses} zones={zones} />
    </div>
  );
}
