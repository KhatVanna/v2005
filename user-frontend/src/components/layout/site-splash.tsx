"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "v2005-splash-seen";
const MIN_VISIBLE_MS = 1500;
const FADE_MS = 480;

export function SiteSplash() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") {
        return;
      }
    } catch {
      // Private mode — still show splash once this visit.
    }

    setVisible(true);
    const started = performance.now();

    const finish = () => {
      const elapsed = performance.now() - started;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

      window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => {
          setVisible(false);
          try {
            window.sessionStorage.setItem(STORAGE_KEY, "1");
          } catch {
            // Ignore storage failures.
          }
        }, FADE_MS);
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      window.setTimeout(finish, 2800);
    }

    return () => {
      window.removeEventListener("load", finish);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`site-splash ${leaving ? "site-splash--leave" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading V2005"
    >
      <div className="site-splash__mark" aria-hidden>
        <span className="site-splash__ring" />
        <span className="site-splash__ring site-splash__ring--delayed" />
        <div className="site-splash__logo-wrap">
          <Image
            src="/images/logo_v2005.png"
            alt="V2005"
            width={200}
            height={68}
            priority
            className="site-splash__logo"
          />
        </div>
      </div>
    </div>
  );
}
