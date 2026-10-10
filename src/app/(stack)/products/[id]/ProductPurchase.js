'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { IoCheckmarkCircle, IoChevronDown, IoClose } from 'react-icons/io5';
import QuantityControl from '@/components/products/QuantityControl';
import { useT } from '@/components/Providers';
import { formatPrice } from '@/lib/links';

// more choices than this (e.g. lens powers) show as a grid of buttons instead of a list
const GRID_FROM = 8;

// { Color: 'Brown', Power: '-2.00' } for one option row
function optionMap(variant, types) {
  if (variant.options?.length) return Object.fromEntries(variant.options.map(o => [o.type, o.value]));
  return { [types[0]]: variant.value }; // older API: one type
}

// Price, stock, option pickers and the pinned Add to Cart bar.
// A product can have up to 3 option types (e.g. Color, Size, Power) — one picker each;
// every combination is its own option row with its own stock and price.
export default function ProductPurchase({ product }) {
  const t = useT();
  const dialogRef = useRef(null);
  const [selection, setSelection] = useState({}); // { Color: 'Brown', Power: '-2.00' }
  const [openType, setOpenType] = useState(null); // which picker the sheet shows
  const [missing, setMissing] = useState(null);   // type the shopper must still choose

  const variants    = useMemo(() => product.variants ?? [], [product.variants]);
  const hasVariants = variants.length > 0;
  const types = useMemo(() => {
    if (product.option_types?.length) return product.option_types;
    // older API: one type, named by the first option that has a name
    return hasVariants ? [variants.find(v => v.attribute_name)?.attribute_name ?? t('option')] : [];
  }, [product.option_types, hasVariants, variants, t]);

  const rows = useMemo(() => variants.map(v => ({ variant: v, opts: optionMap(v, types) })), [variants, types]);

  // rows matching the current choices, optionally ignoring one type (to list that type's choices)
  const matching = (sel, except = null) =>
    rows.filter(({ opts }) => types.every(type => type === except || !sel[type] || opts[type] === sel[type]));

  const complete = types.length > 0 && types.every(type => selection[type]);
  const selected = complete ? matching(selection)[0]?.variant ?? null : null;

  // each type's values in the order the shop listed them
  const valuesOf = (type) => [...new Set(rows.map(({ opts }) => opts[type]).filter(Boolean))];

  // choices follow the type order (Color → Size → Power): earlier choices limit the later ones
  const before = (type) => Object.fromEntries(types.slice(0, types.indexOf(type)).map(tp => [tp, selection[tp]]));

  // can this value be bought together with the earlier choices?
  const available = (type, value) =>
    matching({ ...before(type), [type]: value }).some(({ variant }) => variant.is_in_stock);

  // a value that would complete the selection: show that option's price and stock in the sheet
  const outcome = (type, value) => {
    const next = { ...selection, [type]: value };
    return types.every(tp => next[tp]) ? matching(next)[0]?.variant ?? null : null;
  };

  const choose = (type, value) => {
    if (!available(type, value)) return;
    const next = { ...selection, [type]: value };
    // clear later choices that can't be bought with this one (e.g. a power sold out in Grey)
    for (const later of types.slice(types.indexOf(type) + 1)) {
      const upTo = Object.fromEntries(types.slice(0, types.indexOf(later) + 1).map(tp => [tp, next[tp]]));
      if (next[later] && !matching(upTo).some(({ variant }) => variant.is_in_stock)) delete next[later];
    }
    setSelection(next);
    setMissing(null);
    dialogRef.current?.close();
  };

  // price: the chosen option's, otherwise the lowest among what still matches
  const candidates = matching(selection).map(({ variant }) => variant);
  const prices = (candidates.length ? candidates : variants).map(v => v.price);
  const price = selected ? selected.price : hasVariants ? Math.min(...prices) : product.sell_price;
  const priceVaries = !selected && new Set(prices).size > 1;
  const inStock = selected ? selected.is_in_stock : product.is_in_stock;
  const stock   = selected ? selected.stock : product.stock;

  // the cart line — each option (or combination) is its own line
  const purchasable = hasVariants
    ? selected && {
        id:           product.id,
        variantId:    selected.id,
        variantLabel: types.map(type => `${type}: ${selection[type]}`).join(' · '),
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

  const openPicker = (type) => {
    setOpenType(type);
    dialogRef.current?.showModal();
  };

  // Add to Cart before everything is chosen: point at the first empty picker
  const askForMissing = () => {
    const first = types.find(type => !selection[type]);
    setMissing(first);
    openPicker(first);
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
          {priceVaries
            ? t('from_price', { price: formatPrice(price) })
            : `${formatPrice(price)} ${t('mmk')}`}
        </p>
        {(!hasVariants || selected) && (
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${inStock ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
            {inStock ? t('stock_count', { count: stock }) : t('out_of_stock')}
          </span>
        )}
      </div>

      {/* one picker per option type: Color, Size, Power */}
      {types.map(type => (
        <div key={type} className="mb-4">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-text-secondary">{type}</p>
          <button
            type="button"
            onClick={() => openPicker(type)}
            aria-haspopup="dialog"
            className={`flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-left ${missing === type ? 'border-danger' : 'border-border'}`}
          >
            <span className={selection[type] ? 'font-medium' : 'text-placeholder'}>
              {selection[type] ?? t('select_option_title', { option: type })}
            </span>
            <IoChevronDown size={18} className="text-text-secondary" />
          </button>
          {missing === type && <p className="mt-1.5 text-sm text-danger">{t('select_option_message', { option: type })}</p>}
        </div>
      ))}

      {/* pinned to the bottom on mobile so it's reachable while scrolling specs; inline on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:z-auto md:mb-6 md:border-0 md:bg-transparent md:p-0">
        {purchasable ? (
          <QuantityControl item={purchasable} size="lg" />
        ) : (
          <button
            type="button"
            onClick={askForMissing}
            className="h-12 w-full rounded-xl bg-primary text-[15px] font-bold text-white"
          >
            {t('add_to_cart')}
          </button>
        )}
      </div>

      {hasVariants && (
        <dialog
          ref={dialogRef}
          aria-label={openType ? t('select_option_title', { option: openType }) : undefined}
          className="m-0 mt-auto max-h-[80vh] w-full max-w-none rounded-t-2xl bg-background p-0 text-text backdrop:bg-black/50 md:m-auto md:max-w-md md:rounded-2xl"
        >
          {openType && (
            <>
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-4">
                <h2 className="text-lg font-bold">{t('select_option_title', { option: openType })}</h2>
                <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t('close')} className="p-1">
                  <IoClose size={24} />
                </button>
              </div>
              {valuesOf(openType).length > GRID_FROM ? (
                // long lists (e.g. 40 lens powers): a grid of buttons that fits on one screen
                <div className="grid grid-cols-5 gap-2 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
                  {valuesOf(openType).map(value => {
                    const active = selection[openType] === value;
                    const canBuy = available(openType, value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => choose(openType, value)}
                        disabled={!canBuy}
                        aria-pressed={active}
                        aria-label={canBuy ? value : `${value} · ${t('out_of_stock')}`}
                        className={`h-11 rounded-lg border text-sm font-semibold tabular-nums disabled:border-border disabled:bg-surface disabled:text-text-disabled disabled:line-through ${active ? 'border-primary bg-primary text-white' : 'border-border bg-card'}`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : (
              <ul className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1">
                {valuesOf(openType).map(value => {
                  const active = selection[openType] === value;
                  const canBuy = available(openType, value);
                  const result = outcome(openType, value);
                  return (
                    <li key={value}>
                      <button
                        type="button"
                        onClick={() => choose(openType, value)}
                        disabled={!canBuy}
                        aria-pressed={active}
                        className={`flex w-full items-center rounded-lg px-2 py-3.5 text-left disabled:opacity-50 ${active ? 'bg-primary-light' : 'border-b border-border'}`}
                      >
                        <span className="flex-1">
                          <span className={`block font-semibold ${active ? 'text-primary' : ''}`}>{value}</span>
                          {/* price and stock once this choice completes the selection */}
                          {!canBuy ? (
                            <span className="text-xs text-text-secondary">{t('out_of_stock')}</span>
                          ) : result && (
                            <span className="text-xs text-text-secondary">
                              {formatPrice(result.price)} {t('mmk')} · {t('stock_count', { count: result.stock })}
                            </span>
                          )}
                        </span>
                        {active && <IoCheckmarkCircle size={22} className="text-primary" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
              )}
            </>
          )}
        </dialog>
      )}
    </>
  );
}
