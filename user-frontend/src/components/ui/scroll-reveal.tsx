"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  as?: "div" | "section" | "article" | "li";
  /** Apple marketing-page motion: longer ease, more travel */
  variant?: "default" | "apple";
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  once = true,
  as: Tag = "div",
  variant = "default",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      setVisible(true);
      if (once) return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
          return;
        }
        if (!once) setVisible(false);
      },
      {
        threshold: variant === "apple" ? 0.18 : 0.12,
        rootMargin: variant === "apple" ? "0px 0px -12% 0px" : "0px 0px -10% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, variant]);

  const style: CSSProperties | undefined =
    delay > 0
      ? {
          transitionDelay: visible ? `${delay}ms` : "0ms",
        }
      : undefined;

  const variantClass = variant === "apple" ? "scroll-reveal--apple" : "";

  return (
    <Tag
      ref={ref as never}
      className={`scroll-reveal ${variantClass} ${visible ? "scroll-reveal--in" : ""} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
}
