'use client';

import { useEffect } from 'react';
import { IoCloudOfflineOutline } from 'react-icons/io5';
import EmptyState from '@/components/EmptyState';
import { useT } from '@/components/Providers';

// Shown when a tab's data can't be loaded (e.g. the API is down)
export default function TabError({ error, retry }) {
  const t = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState Icon={IoCloudOfflineOutline} title={t('error')}>
      <button type="button" onClick={() => retry()} className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white">
        {t('retry')}
      </button>
    </EmptyState>
  );
}
