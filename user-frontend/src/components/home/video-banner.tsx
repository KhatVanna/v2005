"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

type VideoBannerProps = {
  src?: string;
  poster?: string;
};

export function VideoBanner({
  src = "/videos/banner.mp4",
  poster = "/videos/banner-poster.png",
}: VideoBannerProps) {
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

  function togglePlay() {
    setPlaying((value) => !value);
  }

  return (
    <section className="bg-[#0a0a0a]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-black">
          <div className="relative aspect-[16/9] w-full">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={src}
              poster={poster}
              muted
              loop
              playsInline
              autoPlay
              onClick={togglePlay}
            />

            <button
              type="button"
              aria-label={playing ? "Pause video" : "Play video"}
              onClick={togglePlay}
              className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg transition hover:bg-zinc-100 sm:bottom-5 sm:right-5"
            >
              {playing ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current pl-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
