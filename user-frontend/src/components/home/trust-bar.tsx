import { CreditCard, RefreshCcw, Tag, Truck } from "lucide-react";

const trustItems = [
  {
    title: "Secure Payment",
    description: "Cards, wallets & protected checkout",
    icon: CreditCard,
  },
  {
    title: "Fast Shipment",
    description: "Express delivery options available",
    icon: Truck,
  },
  {
    title: "Easy Returns",
    description: "Hassle-free refunds when eligible",
    icon: RefreshCcw,
  },
  {
    title: "Transparent Prices",
    description: "No hidden fees at checkout",
    icon: Tag,
  },
];

export function TrustBar() {
  return (
    <section className="bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-[#2563EB] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <item.icon className="mt-0.5 h-6 w-6 shrink-0 text-white" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide">{item.title}</h3>
              <p className="mt-1 text-sm text-white/80">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
