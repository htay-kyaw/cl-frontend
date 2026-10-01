'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoClose, IoOptionsOutline } from 'react-icons/io5';
import { useT } from '@/components/Providers';
import { productQueryHref, SORTS } from '@/lib/productQuery';

// Filter button + sheet: sort and attribute chips (e.g. Brand, Color) for the current category
export default function FilterSheet({ query, groups }) {
  const t = useT();
  const router = useRouter();
  const dialogRef = useRef(null);
  const [draft, setDraft] = useState({ sort: query.sort, filters: query.filters });

  const activeCount = Object.keys(query.filters).length + (query.sort !== 'newest' ? 1 : 0);
  const draftCount  = Object.keys(draft.filters).length + (draft.sort !== 'newest' ? 1 : 0);

  const open = () => {
    setDraft({ sort: query.sort, filters: query.filters }); // start from what's applied
    dialogRef.current?.showModal();
  };

  const toggle = (name, value) => setDraft(d => {
    const filters = { ...d.filters };
    if (filters[name] === value) delete filters[name];
    else filters[name] = value;
    return { ...d, filters };
  });

  const apply = () => {
    dialogRef.current?.close();
    router.replace(productQueryHref({ ...query, ...draft }), { scroll: false });
  };

  const chip = (active) => `rounded-full border-[1.5px] px-3.5 py-2 text-[13px] ${active ? 'border-primary bg-primary-light font-semibold text-primary' : 'border-border bg-surface'}`;
  const groupNames = Object.keys(groups);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={t('filters')}
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${activeCount ? 'border-primary bg-primary text-white' : 'border-border bg-surface'}`}
      >
        <IoOptionsOutline size={20} />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        onClick={e => e.target === dialogRef.current && dialogRef.current.close()}
        className="m-0 mt-auto max-h-[85vh] w-full max-w-none rounded-t-2xl bg-background p-0 text-text backdrop:bg-black/50 md:m-auto md:max-w-lg md:rounded-2xl"
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <button type="button" onClick={() => dialogRef.current.close()} aria-label={t('close')} className="p-1">
              <IoClose size={22} />
            </button>
            <h2 className="text-[17px] font-bold">{t('filters')}</h2>
            <button
              type="button"
              onClick={() => setDraft({ sort: 'newest', filters: {} })}
              className={`text-sm ${draftCount ? 'text-primary' : 'text-text-secondary'}`}
            >
              {t('clear_all')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <fieldset className="mb-6">
              <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">{t('sort_by')}</legend>
              <div className="flex flex-wrap gap-2">
                {SORTS.map(s => (
                  <button key={s} type="button" aria-pressed={draft.sort === s} onClick={() => setDraft(d => ({ ...d, sort: s }))} className={chip(draft.sort === s)}>
                    {t(`sort_${s}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            {groupNames.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-text-secondary"><IoOptionsOutline /> {t('no_filters')}</p>
            ) : groupNames.map(name => (
              <fieldset key={name} className="mb-6">
                <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">{name}</legend>
                <div className="flex flex-wrap gap-2">
                  {groups[name].map(value => {
                    const active = draft.filters[name] === value;
                    return (
                      <button key={value} type="button" aria-pressed={active} onClick={() => toggle(name, value)} className={chip(active)}>
                        {value}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button type="button" onClick={apply} className="h-[52px] w-full rounded-2xl bg-primary font-bold text-white">
              {draftCount ? t('show_results_count', { count: draftCount }) : t('show_results')}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
