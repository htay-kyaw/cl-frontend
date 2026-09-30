'use client';

import { useTransition } from 'react';
import { IoLogOutOutline } from 'react-icons/io5';
import { signOut } from '@/app/actions/auth';
import { useT } from '@/components/Providers';
import useCartStore from '@/store/cartStore';

export default function LogoutButton() {
  const t = useT();
  const [pending, startTransition] = useTransition();

  const logout = () => {
    if (!window.confirm(t('logout_confirm'))) return;
    startTransition(async () => {
      useCartStore.getState().clearCart();
      await signOut();
    });
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-2xl border-[1.5px] border-danger py-3.5 font-semibold text-danger disabled:opacity-50"
    >
      <IoLogOutOutline size={20} />
      {t('logout')}
    </button>
  );
}
