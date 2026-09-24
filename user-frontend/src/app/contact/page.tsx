import type { Metadata } from "next";
import Link from "next/link";
import { Headphones, Mail, MapPin, Phone } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with V2005 customer support.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <ScrollReveal>
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Contact</span>
        </nav>
      </ScrollReveal>

      <ScrollReveal delay={40}>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-navy">Contact</h1>
          <p className="mt-3 text-lg font-medium">Tel: +1 (000) 000-0000</p>
          <p className="mt-2 text-muted-foreground">
            Questions about a product or your order? We typically reply within 24 hours.
          </p>
        </div>
      </ScrollReveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <ScrollReveal delay={0}>
          <InfoCard
            icon={<Headphones className="h-5 w-5 text-primary" />}
            title="Help & Contact"
            text="Speak with support for product advice and order help."
          />
        </ScrollReveal>
        <ScrollReveal delay={90}>
          <InfoCard
            icon={<Mail className="h-5 w-5 text-primary" />}
            title="Email"
            text="support@v2005.local"
          />
        </ScrollReveal>
        <ScrollReveal delay={180}>
          <InfoCard
            icon={<MapPin className="h-5 w-5 text-primary" />}
            title="Service Hours"
            text="Mon–Fri, 9:00–18:00"
          />
        </ScrollReveal>
      </div>

      <ScrollReveal delay={80} className="mx-auto mt-10 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Make contact</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send us a message and our team will get back to you soon.
          </p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="First name"
            />
            <input
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="Last name"
            />
            <input
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary sm:col-span-2"
              placeholder="Email *"
              type="email"
            />
            <textarea
              className="min-h-32 rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary sm:col-span-2"
              placeholder="Message *"
            />
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-semibold uppercase tracking-wide text-background sm:col-span-2"
            >
              <Phone className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </ScrollReveal>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
      <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
