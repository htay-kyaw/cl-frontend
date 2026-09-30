'use client';

import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';
import { useT } from '../Providers';

export default function BackButton({ fallback = '/' }) {
  const t      = useT();
  const router = useRouter();

  // opened from a shared link there's no history to go back to
  const goBack = () => (window.history.length > 1 ? router.back() : router.push(fallback));

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t('back')}
      className="flex h-10 w-10 items-center justify-center rounded-full text-text hover:bg-surface"
    >
      <IoArrowBack size={22} />
    </button>
  );
}
