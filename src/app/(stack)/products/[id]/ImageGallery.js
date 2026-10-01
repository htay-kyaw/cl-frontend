'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

// Swipeable product images with dots; thumbnails on desktop
export default function ImageGallery({ images, alt }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return <div className="aspect-square w-full bg-surface md:rounded-2xl" />;

  const goTo = (i) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (track) setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:rounded-2xl [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative aspect-square w-full shrink-0 snap-center bg-surface">
              <Image
                src={src}
                alt={i === 0 ? alt : ''}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
            {images.map((src, i) => (
              <span key={src + i} className={`h-[7px] w-[7px] rounded-full ${i === index ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="hidden gap-2 md:flex">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${i + 1} / ${images.length}`}
              aria-current={i === index}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${i === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
