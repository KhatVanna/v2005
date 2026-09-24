"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export function HeroSlider() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [playing]);

  return (
    <section className="relative isolate min-h-[28rem] overflow-hidden bg-[#0F172A] text-white sm:min-h-[32rem] lg:min-h-[36rem]">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/TVC.mp4"
        poster="/videos/TVC-poster.jpg"
        muted
        loop
        playsInline
        autoPlay
        aria-label="V2005 TVC promotional video"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/55 to-[#0F172A]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/55 via-transparent to-black/15" />

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:py-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
          New Season
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Ready to upgrade to the next level?
        </h1>
        <p className="mt-4 max-w-xl text-base text-zinc-200 sm:text-lg">
          Discover premium tech and everyday essentials at V2005.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition hover:opacity-90"
          >
            Shop Now
          </Link>
        </div>
      </div>

      <button
        type="button"
        aria-label={playing ? "Pause video" : "Play video"}
        onClick={() => setPlaying((value) => !value)}
        className="absolute bottom-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg transition hover:bg-zinc-100 sm:bottom-6 sm:right-6"
      >
        {playing ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current pl-0.5" />
        )}
      </button>
    </section>
  );
}
