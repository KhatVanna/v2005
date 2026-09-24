"use client";

import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { Logo } from "@/components/logo";
import { RegionSelector } from "@/components/layout/region-selector";

const menuLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Blog & News", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const aboutLinks = [
  { label: "Imprint", href: "/about" },
  { label: "Data protection", href: "/privacy" },
  { label: "Refund policy", href: "/refunds" },
  { label: "Shipping guidelines", href: "/shipping" },
  { label: "Terms of Use", href: "/terms" },
];

const paymentMethods = [
  {
    id: "khqr",
    label: "KHQR",
    src: "/images/images_payment_method/KHQR_lcon.webp",
  },
  {
    id: "aba-payway",
    label: "ABA PayWay",
    src: "/images/images_payment_method/ABA_payway_Icon.svg",
  },
] as const;

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  { label: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
] as const;

const snowflakePattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.07' stroke-width='1'%3E%3Cpath d='M40 12v56M18 26l44 28M18 54l44-28'/%3E%3Cpath d='M40 20l4 6-4 2-4-2zM40 54l4 6-4 2-4-2zM24 30l7 1-1 4-5 1zM49 45l7 1-1 4-5 1zM24 50l7-1-1-4-5-1zM49 35l7-1-1-4-5-1z'/%3E%3C/g%3E%3C/svg%3E")`;

export function SiteFooter() {
  return (
    <footer
      className="relative mt-auto overflow-hidden bg-black text-zinc-300"
      style={{ backgroundImage: snowflakePattern }}
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-8 pt-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-4">
            <Logo height={44} priority={false} className="brightness-0 invert" />
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              Share contact information, store details and brand content with your
              customers.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">menu</h3>
            <ul className="space-y-2.5">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-300 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">About Us</h3>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-300 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Help & Contact</h3>
            <p className="mb-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Need any advice before you buy? We&apos;re here to help.
            </p>
            <Link
              href="/contact"
              className="text-sm font-medium text-white underline underline-offset-4 transition hover:text-zinc-200"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-2.5">
          {paymentMethods.map((method) => (
            <span
              key={method.id}
              className="inline-flex h-9 min-w-14 items-center justify-center rounded-md bg-white px-2 shadow-sm"
              title={method.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={method.src}
                alt={method.label}
                className="h-6 w-auto object-contain"
              />
            </span>
          ))}
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()}. V2005. Premium E-Commerce Marketplace
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-white transition hover:text-zinc-300"
                  >
                    <SocialGlyph name={social.icon} />
                  </a>
                ))}
              </div>

              <RegionSelector />

              <button
                type="button"
                aria-label="Back to top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-white transition hover:border-zinc-500 hover:bg-zinc-800"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialGlyph({ name }: { name: (typeof socialLinks)[number]["icon"] }) {
  const className = "h-5 w-5 fill-current";

  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5zM17.5 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M23 12.2s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C18.5 5.2 12 5.2 12 5.2s-6.5 0-8.8.5c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 2.3.5 8.8.5 8.8.5s6.5 0 8.8-.5c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7zM9.8 15.5v-6.6l5.7 3.3-5.7 3.3z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M16.6 5.8c-.7.3-1.4.6-2.2.6h-.2V14a3.4 3.4 0 1 1-2.3-3.2v2.1a1.4 1.4 0 1 0 1 .3V4.5h2.1c.1 1.2.8 2.3 1.6 3.1z" />
    </svg>
  );
}
