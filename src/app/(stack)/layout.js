import TopNav from '@/components/nav/TopNav';

// Pushed screens (cart, checkout, details): back button header, no bottom tab bar — like the mobile stack.
// Wide enough for the two-column product page; form-like screens narrow themselves.
export default function StackLayout({ children }) {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-5xl flex-1 pb-10 md:px-6">{children}</main>
    </>
  );
}
