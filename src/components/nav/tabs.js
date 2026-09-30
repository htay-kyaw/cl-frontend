import { IoGridOutline, IoHomeOutline, IoPersonOutline, IoReceiptOutline } from 'react-icons/io5';

// Same tabs and icons as the mobile app's bottom tab navigator
export const TABS = [
  { href: '/',         label: 'home',     Icon: IoHomeOutline },
  { href: '/products', label: 'products', Icon: IoGridOutline },
  { href: '/orders',   label: 'orders',   Icon: IoReceiptOutline },
  { href: '/profile',  label: 'profile',  Icon: IoPersonOutline },
];

export function isActive(pathname, href) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
