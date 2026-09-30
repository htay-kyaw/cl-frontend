import { IoGiftOutline, IoPersonCircleOutline } from 'react-icons/io5';
import PageHeader from '@/components/nav/PageHeader';
import SignInPrompt from '@/components/SignInPrompt';
import { getLocale, getT, getTheme } from '@/lib/preferences';
import { getCurrentUser } from '@/lib/session';
import LogoutButton from './LogoutButton';
import NameEditor from './NameEditor';
import SettingsCard from './SettingsCard';
import SocialLinks from './SocialLinks';

export async function generateMetadata() {
  const t = await getT();
  return { title: t('profile') };
}

const cardLabel = 'mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-secondary';

export default async function ProfilePage() {
  const [t, user, theme, locale] = await Promise.all([getT(), getCurrentUser(), getTheme(), getLocale()]);

  return (
    <>
      <PageHeader title={t('profile')} cart={false} />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 py-5 md:px-0">
        {user ? (
          <>
            {/* Avatar */}
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- Google profile photo
              <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="mx-auto mb-1 h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="mx-auto mb-1 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
                {(user.name?.[0] ?? '?').toUpperCase()}
              </div>
            )}

            {/* Account */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <p className={cardLabel}>Name</p>
              <NameEditor name={user.name} />

              <p className={`${cardLabel} mt-3`}>Email</p>
              <p className="font-medium">{user.email}</p>

              <p className={`${cardLabel} mt-3`}>Phone</p>
              <p className="font-medium">{user.phone ?? '—'}</p>
            </section>

            {/* Points */}
            <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <p className={cardLabel}>Points</p>
                <p className="text-2xl font-bold text-primary">{user.points ?? 0}</p>
              </div>
              <IoGiftOutline size={32} className="text-primary" />
            </section>
          </>
        ) : (
          <SignInPrompt Icon={IoPersonCircleOutline} message={t('sign_in_profile')} next="/profile" />
        )}

        <SettingsCard theme={theme} locale={locale} />
        <SocialLinks />
        {user && <LogoutButton />}
      </div>
    </>
  );
}
