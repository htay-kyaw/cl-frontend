import BottomNav from '@/components/nav/BottomNav';
import TopNav from '@/components/nav/TopNav';

// Tab screens: bottom tab bar on mobile, top bar on desktop.
// Mobile bottom padding = tab bar height (3.5rem) + 1.5rem breathing room + safe area,
// so the last row of content doesn't sit flush against the tab bar.
export default function TabsLayout({ children }) {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-6 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
