'use server';

import { catalogApi } from '@/lib/api';
import { parseProductQuery, toApiParams } from '@/lib/productQuery';

// Next page of the Products grid for infinite scroll; search is the page's URL query string
export async function loadMoreProducts(search, page) {
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > 500) return { items: [], lastPage: 1 };

  const query = parseProductQuery(new URLSearchParams(String(search ?? '')));
  const { items, last_page } = await catalogApi.products(toApiParams(query, pageNumber));
  return { items, lastPage: last_page };
}
