"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  discount?: number | null;
};

export function ProductGallery({ images, alt, discount }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-muted text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  const activeImage = gallery[Math.min(activeIndex, gallery.length - 1)];

  function goTo(index: number) {
    const next = (index + gallery.length) % gallery.length;
    setActiveIndex(next);
  }

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[72px_minmax(0,1fr)]">
      {/* Desktop vertical thumbs — L192 style */}
      <div className="hidden max-h-[min(70vh,560px)] flex-col gap-2.5 overflow-y-auto lg:flex">
        {gallery.map((image, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`desk-${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-lg border bg-white transition ${
                isActive
                  ? "border-foreground ring-1 ring-foreground"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="72px"
              />
            </button>
          );
        })}
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-white sm:rounded-2xl">
          <Image
            key={activeImage}
            src={activeImage}
            alt={alt}
            fill
            priority
            className="object-contain p-4 sm:p-6"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {discount ? (
            <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground sm:left-4 sm:top-4 sm:px-2.5">
              -{discount}%
            </span>
          ) : null}
        </div>

        {/* Mobile / tablet horizontal thumbs */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 lg:hidden">
          <div className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((image, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={`mob-${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white transition sm:h-20 sm:w-20 ${
                    isActive
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-contain p-1.5"
                    sizes="80px"
                  />
                </button>
              );
            })}
          </div>

          {gallery.length > 1 ? (
            <div className="flex shrink-0 items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Previous image"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Next image"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
