'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IoMegaphoneOutline } from 'react-icons/io5';
import { resolveLink } from '@/lib/links';

const SPEED = 40; // pixels per second — slow and readable, like the mobile app

function Message({ item }) {
  const link = resolveLink(item.link);
  const text = <span className="pr-12 text-[13px] font-semibold leading-6 text-primary">{item.message}</span>;

  if (!link) return text;
  return (
    <Link href={link.href} {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })} className="hover:underline">
      {text}
    </Link>
  );
}

// Scrolling announcement bar. The row is rendered twice and shifted by one row
// width so the loop is seamless; duration scales with length to keep SPEED constant.
export default function AnnouncementTicker({ announcements }) {
  const rowRef = useRef(null);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const update = () => setDuration(row.scrollWidth / SPEED);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => observer.disconnect();
  }, [announcements]);

  if (announcements.length === 0) return null;

  const row = announcements.map(item => <Message key={item.id} item={item} />);

  return (
    <div className="mx-3 mt-2.5 flex items-center gap-2 overflow-hidden rounded-xl bg-primary-light px-3.5 py-1.5 md:mx-0">
      <IoMegaphoneOutline size={16} className="shrink-0 text-primary" />
      <div className="relative h-8 flex-1 overflow-hidden">
        <div
          className="ticker absolute inset-y-0 left-0 flex items-center whitespace-nowrap"
          style={duration ? { animationDuration: `${duration}s` } : { animationPlayState: 'paused' }}
        >
          <div ref={rowRef} className="flex">{row}</div>
          <div className="flex" aria-hidden="true">{row}</div>
        </div>
      </div>
    </div>
  );
}
