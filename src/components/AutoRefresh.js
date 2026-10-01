'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Re-renders the current server page periodically while the tab is visible,
// so order status changes made by the shop show up (the mobile app polls every 15s).
export default function AutoRefresh({ interval = 30000 }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => document.visibilityState === 'visible' && router.refresh();
    const timer = setInterval(tick, interval);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [interval, router]);

  return null;
}
