// Products page state lives in the URL:
//   /products?q=lens&category=4&sort=price_asc&f.Brand=gucci&f.Color=brown
export const SORTS = ['newest', 'price_asc', 'price_desc'];
const PAGE_SIZE = 12; // first page server-rendered, the rest via infinite scroll
const FILTER_PREFIX = 'f.';

// searchParams (object or URLSearchParams) → normalized query
export function parseProductQuery(params) {
  const entries = params instanceof URLSearchParams ? [...params.entries()] : Object.entries(params ?? {});
  const get = (k) => {
    const v = entries.find(([key]) => key === k)?.[1];
    return Array.isArray(v) ? v[0] : v;
  };

  const filters = {};
  for (const [key, value] of entries) {
    if (key.startsWith(FILTER_PREFIX) && key.length > FILTER_PREFIX.length) {
      filters[key.slice(FILTER_PREFIX.length)] = String(Array.isArray(value) ? value[0] : value).slice(0, 100);
    }
  }

  const sort = get('sort');
  return {
    q:        String(get('q') ?? '').trim().slice(0, 100),
    category: Number(get('category')) || null,
    sort:     SORTS.includes(sort) ? sort : 'newest',
    filters,
    // ?page=N lets search engines (and shared links) reach products beyond the first screen
    page:     Math.min(Math.max(Number.parseInt(get('page'), 10) || 1, 1), 500),
  };
}

// normalized query → URL (empty values dropped). The page is only kept when passed explicitly,
// so changing search / category / sort / filters always starts again from page 1.
export function productQueryHref(query, page = 1) {
  const p = new URLSearchParams();
  if (query.q) p.set('q', query.q);
  if (query.category) p.set('category', String(query.category));
  if (query.sort && query.sort !== 'newest') p.set('sort', query.sort);
  for (const [name, value] of Object.entries(query.filters ?? {})) {
    if (value) p.set(FILTER_PREFIX + name, value);
  }
  if (page > 1) p.set('page', String(page));
  const s = p.toString();
  return s ? `/products?${s}` : '/products';
}

// normalized query → Laravel API params
export function toApiParams(query, page = 1) {
  const params = {
    search: query.q || undefined,
    category_id: query.category || undefined,
    sort: query.sort !== 'newest' ? query.sort : undefined,
    page,
    per_page: PAGE_SIZE,
  };
  for (const [name, value] of Object.entries(query.filters ?? {})) params[`attr[${name}]`] = value;
  return params;
}
