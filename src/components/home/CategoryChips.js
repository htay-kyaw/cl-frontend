import Link from 'next/link';

// Category filter chips; the selection lives in the URL (?category=) so it's shareable
export default function CategoryChips({ categories, selected, allLabel }) {
  const chip = (active) =>
    `flex min-h-11 shrink-0 items-center rounded-full border-[1.5px] px-[18px] text-[13px] font-semibold ${
      active ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text'
    }`;

  return (
    <nav aria-label="Categories" className="my-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto flex w-max gap-2 px-3 py-1.5 md:px-0">
        <Link href="/" scroll={false} aria-current={selected == null ? 'page' : undefined} className={chip(selected == null)}>
          {allLabel}
        </Link>
        {categories.map(c => (
          <Link
            key={c.id}
            href={`/?category=${c.id}`}
            scroll={false}
            aria-current={selected === c.id ? 'page' : undefined}
            className={chip(selected === c.id)}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
