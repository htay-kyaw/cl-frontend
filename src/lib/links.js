// Banners and announcements carry admin-entered links: "product/12", "category/3" or a full URL.
// Returns { href, external } or null when there's nothing to open.
export function resolveLink(link) {
  if (!link) return null;

  const [type, id] = link.split('/');
  if (type === 'product' && Number(id)) return { href: `/products/${Number(id)}`, external: false };
  if (type === 'category' && Number(id)) return { href: `/?category=${Number(id)}`, external: false };
  if (/^https?:\/\//i.test(link)) return { href: link, external: true };

  return null;
}

export const formatPrice = (value) => Number(value).toLocaleString('en-US');
