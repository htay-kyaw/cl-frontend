import CartButton from '../CartButton';
import BackButton from './BackButton';

// Screen header like the mobile app's: back arrow (stack screens), title, cart button.
// On mobile it's a sticky bar; from md up TopNav is the bar, so it becomes a page heading.
export default function PageHeader({ title, back = false, cart = true }) {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-border bg-background px-2 md:hidden">
        {back ? <BackButton /> : <span className="w-2" />}
        <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
        {cart && <CartButton />}
      </header>

      <div className="hidden items-center gap-2 pb-2 pt-8 md:flex">
        {back && <BackButton />}
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
    </>
  );
}
