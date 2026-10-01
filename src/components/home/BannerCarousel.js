'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { resolveLink } from '@/lib/links';
import { useT } from '../Providers';

const INTERVAL = 3500; // auto-slide every 3.5 seconds, like the mobile app

// Swipeable banner slider (CSS scroll-snap) with auto-advance and dot indicators
export default function BannerCarousel({ banners }) {
  const t        = useT();
  const trackRef = useRef(null);
  const paused   = useRef(false);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  }, []);

  // keep the dots in sync with manual swipes
  const onScroll = () => {
    const track = trackRef.current;
    if (track) setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => {
      const track = trackRef.current;
      if (paused.current || !track) return;
      goTo((Math.round(track.scrollLeft / track.clientWidth) + 1) % banners.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [banners.length, goTo]);

  if (banners.length === 0) return null;

  const pause  = () => { paused.current = true; };
  const resume = () => { paused.current = false; };

  return (
    <section aria-roledescription="carousel" className="md:pt-4">
      <div
        ref={trackRef}
        onScroll={onScroll}
        onPointerEnter={pause}
        onPointerLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:rounded-2xl [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner, i) => {
          const link = resolveLink(banner.link);
          return (
            <div key={banner.id} className="relative aspect-[2/1] w-full shrink-0 snap-center bg-surface md:aspect-[3/1]">
              {banner.image && (
                <Image
                  src={banner.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1152px) 1104px, 100vw"
                  className="object-cover"
                />
              )}
              {link && (
                <Link
                  href={link.href}
                  {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  className="absolute bottom-4 left-4 rounded-full bg-primary px-4.5 py-2 text-[13px] font-bold text-white shadow"
                >
                  {t('view_details')}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`${i + 1} / ${banners.length}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-[18px] bg-primary' : 'w-1.5 bg-border'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
