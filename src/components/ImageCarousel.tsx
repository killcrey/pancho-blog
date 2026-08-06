"use client";

import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export function ImageCarousel({ images, alt }: Props) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  function goTo(next: number) {
    setIndex((next + images.length) % images.length);
  }

  return (
    <div className="relative">
      <div className="flex h-72 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-panel-2 sm:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${alt} — image ${index + 1} of ${images.length}`}
          className="h-full w-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/80 text-fg hover:border-gold hover:text-gold"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/80 text-fg hover:border-gold hover:text-gold"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === index ? "bg-gold" : "bg-fg/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
