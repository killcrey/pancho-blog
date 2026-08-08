"use client";

import { useEffect, useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export function ImageCarousel({ images, alt }: Props) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, index]);

  if (images.length === 0) return null;

  function goTo(next: number) {
    setIndex((next + images.length) % images.length);
  }

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setLightboxOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setLightboxOpen(true);
        }}
        aria-label="Open image full size"
        className="flex h-72 w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-border bg-panel-2 sm:h-96"
      >
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

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-10"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg/80 text-lg text-fg hover:border-gold hover:text-gold"
          >
            ×
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={`${alt} — image ${index + 1} of ${images.length}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-default object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index - 1);
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/80 text-fg hover:border-gold hover:text-gold sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index + 1);
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/80 text-fg hover:border-gold hover:text-gold sm:right-6"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
