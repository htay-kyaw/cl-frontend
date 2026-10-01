'use client';

import { useEffect, useRef, useState } from 'react';
import { IoCheckmarkCircle, IoChevronDown, IoClose } from 'react-icons/io5';
import QuantityControl from '@/components/products/QuantityControl';
import { useT } from '@/components/Providers';
import { formatPrice } from '@/lib/links';

// Price, stock, variant picker and the pinned Add to Cart bar.
// Variant products (e.g. lens powers) must have a variant chosen before adding to cart.
export default function ProductPurchase({ product }) {
  const t = useT();
  const dialogRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(false);

  const variants    = product.variants ?? [];
  const hasVariants = variants.length > 0;
  // some variants have no attribute name — label by the first one that does
  const optionName  = variants.find(v => v.attribute_name)?.attribute_name ?? t('option');

  const price   = selected ? selected.price : hasVariants ? Math.min(...variants.map(v => v.price)) : product.sell_price;
  const inStock = selected ? selected.is_in_stock : product.is_in_stock;
  const stock   = selected ? selected.stock : product.stock;

  // the cart line — each variant is its own line
  const purchasable = hasVariants
    ? selected && {
        id:           product.id,
        variantId:    selected.id,
        variantLabel: `${optionName}: ${selected.value}`,
        name:         product.name,
        image:        product.image,
        sell_price:   selected.price,
        stock:        selected.stock,
        is_in_stock:  selected.is_in_stock,
      }
    : {
        id: product.id, variantId: null, name: product.name, image: product.image,
        sell_price: product.sell_price, stock: product.stock, is_in_stock: product.is_in_stock,
      };

  const openPicker = () => dialogRef.current?.showModal();
  const closePicker = () => dialogRef.current?.close();

  const choose = (v) => {
    if (!v.is_in_stock) return;
    setSelected(v);
    setHint(false);
    closePicker();
  };

  // close the sheet when tapping the backdrop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (e) => { if (e.target === dialog) dialog.close(); };
    dialog.addEventListener('click', onClick);
    return () => dialog.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-2xl font-bold text-primary">
          {hasVariants && !selected ? t('from_price', { price: formatPrice(price) }) : formatPrice(price)} {t('mmk')}
        </p>
        {(!hasVariants || selected) && (
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${inStock ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
            {inStock ? t('stock_count', { count: stock }) : t('out_of_stock')}
          </span>
        )}
      </div>

      {hasVariants && (
        <div className="mb-4">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-text-secondary">{optionName}</p>
          <button
            type="button"
            onClick={openPicker}
            aria-haspopup="dialog"
            className={`flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-left ${hint ? 'border-danger' : 'border-border'}`}
          >
            <span className={selected ? 'font-medium' : 'text-placeholder'}>
              {selected ? selected.value : t('select_option_title', { option: optionName })}
            </span>
            <IoChevronDown size={18} className="text-text-secondary" />
          </button>
          {hint && <p className="mt-1.5 text-sm text-danger">{t('select_option_message', { option: optionName })}</p>}
        </div>
      )}

      {/* pinned to the bottom on mobile so it's reachable while scrolling specs; inline on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:z-auto md:mb-6 md:border-0 md:bg-transparent md:p-0">
        {purchasable ? (
          <QuantityControl item={purchasable} size="lg" />
        ) : (
          <button
            type="button"
            onClick={() => { setHint(true); openPicker(); }}
            className="h-12 w-full rounded-xl bg-primary text-[15px] font-bold text-white"
          >
            {t('add_to_cart')}
          </button>
        )}
      </div>

      {hasVariants && (
        <dialog
          ref={dialogRef}
          aria-label={t('select_option_title', { option: optionName })}
          className="m-0 mt-auto max-h-[80vh] w-full max-w-none rounded-t-2xl bg-background p-0 text-text backdrop:bg-black/50 md:m-auto md:max-w-md md:rounded-2xl"
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-4">
            <h2 className="text-lg font-bold">{t('select_option_title', { option: optionName })}</h2>
            <button type="button" onClick={closePicker} aria-label={t('close')} className="p-1">
              <IoClose size={24} />
            </button>
          </div>
          <ul className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1">
            {variants.map(v => {
              const active = selected?.id === v.id;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => choose(v)}
                    disabled={!v.is_in_stock}
                    aria-pressed={active}
                    className={`flex w-full items-center rounded-lg px-2 py-3.5 text-left disabled:opacity-50 ${active ? 'bg-primary-light' : 'border-b border-border'}`}
                  >
                    <span className="flex-1">
                      <span className={`block font-semibold ${active ? 'text-primary' : ''}`}>{v.value}</span>
                      <span className="text-xs text-text-secondary">
                        {formatPrice(v.price)} {t('mmk')} · {v.is_in_stock ? t('stock_count', { count: v.stock }) : t('out_of_stock')}
                      </span>
                    </span>
                    {active && <IoCheckmarkCircle size={22} className="text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </dialog>
      )}
    </>
  );
}
