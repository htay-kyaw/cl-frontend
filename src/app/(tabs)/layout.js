import BottomNav from '@/components/nav/BottomNav';
import TopNav from '@/components/nav/TopNav';

// Tab screens: bottom tab bar on mobile, top bar on desktop
export default function TabsLayout({ children }) {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:px-6 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
