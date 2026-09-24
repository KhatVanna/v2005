import type { DemoCategory, DemoProduct } from "@/data/demo-catalog.types";

export type { DemoCategory, DemoProduct };

/** Each unique product name maps to its own matching white-background image. */
export const PRODUCT_IMAGE_BY_NAME: Record<string, string> = {
  "Wireless Noise-Cancelling Headphones":
    "/images/products/wireless-headphones.png",
  "Magnetic Wireless Charger 15W": "/images/products/wireless-charger.png",
  "Portable Power Bank 10000mAh PD": "/images/products/power-bank.png",
  "Smartwatch IP67 Fitness Edition": "/images/products/smartwatch.png",
  "Bluetooth Earbuds Pro": "/images/products/bluetooth-earbuds-pro.png",
  "USB-C Fast Charge Cable 2m": "/images/products/usb-c-fast-charge-cable-2m.png",
  "Phone Tripod Stand Mini": "/images/products/phone-tripod-stand-mini.png",
  "MagSafe Car Mount": "/images/products/magsafe-car-mount.png",
  "Screen Protector Glass Pack": "/images/products/screen-protector-glass-pack.png",
  "Silicone Phone Case Clear": "/images/products/silicone-phone-case-clear.png",

  "Compact Air Fryer 9L Digital Touch": "/images/products/air-fryer-9l.png",
  "Dual Zone Air Fryer 23L XXL": "/images/products/air-fryer-23l.png",
  "Electric Kettle Stainless 1.7L":
    "/images/products/electric-kettle-stainless-1-7l.png",
  "Blender Pro Glass Jug": "/images/products/blender-pro-glass-jug.png",
  "Toaster 2-Slice Premium": "/images/products/toaster-2-slice-premium.png",
  "Coffee Maker Drip 12 Cup": "/images/products/coffee-maker-drip-12-cup.png",
  "Hand Mixer Compact": "/images/products/hand-mixer-compact.png",
  "Nonstick Pan Set 3pc": "/images/products/nonstick-pan-set-3pc.png",
  "Digital Kitchen Scale": "/images/products/digital-kitchen-scale.png",
  "Vacuum Sealer Home": "/images/products/vacuum-sealer-home.png",

  "Urban Electric Scooter Pro": "/images/products/electric-scooter.png",
  "Pro Wireless Gaming Controller": "/images/products/gaming-controller.png",
  "RGB Mechanical Keyboard": "/images/products/rgb-mechanical-keyboard.png",
  "Gaming Mouse Pad XL": "/images/products/gaming-mouse-pad-xl.png",
  "VR Headset Comfort Strap": "/images/products/vr-headset-comfort-strap.png",
  "Building Blocks Creative Set":
    "/images/products/building-blocks-creative-set.png",
  "Remote Control Race Car": "/images/products/remote-control-race-car.png",
  "Puzzle Board 1000 Pieces": "/images/products/puzzle-board-1000-pieces.png",
  "Drone Mini Camera Edition": "/images/products/drone-mini-camera-edition.png",
  "Arcade Stick Retro": "/images/products/arcade-stick-retro.png",

  "RPET Roll-Top Everyday Backpack": "/images/products/rolltop-backpack.png",
  "Stainless Sports Bottle 750ml": "/images/products/sports-bottle.png",
  "Laptop Sleeve 15 Inch": "/images/products/laptop-sleeve-15-inch.png",
  "Travel Duffel Bag 40L": "/images/products/travel-duffel-bag-40l.png",
  "Crossbody City Sling": "/images/products/crossbody-city-sling.png",
  "Hiking Daypack 25L": "/images/products/hiking-daypack-25l.png",
  "Drawstring Sport Bag": "/images/products/drawstring-sport-bag.png",
  "Camera Shoulder Bag": "/images/products/camera-shoulder-bag.png",
  "Weekender Canvas Bag": "/images/products/weekender-canvas-bag.png",
  "Insulated Lunch Tote": "/images/products/insulated-lunch-tote.png",

  "Ergonomic Vertical Wireless Mouse": "/images/products/vertical-mouse.png",
  "USB-C Hub 4-Port Multiport Adapter": "/images/products/usb-c-hub.png",
  "Laptop Stand Aluminum": "/images/products/laptop-stand-aluminum.png",
  "Wireless Keyboard Compact": "/images/products/wireless-keyboard-compact.png",
  "Monitor Light Bar": "/images/products/monitor-light-bar.png",
  "Webcam Full HD 1080p": "/images/products/webcam-full-hd-1080p.png",
  "External SSD Enclosure": "/images/products/external-ssd-enclosure.png",
  "Desk Cable Organizer": "/images/products/desk-cable-organizer.png",
  "USB Microphone Condenser": "/images/products/usb-microphone-condenser.png",
  "Portable Monitor 15.6": "/images/products/portable-monitor-15-6.png",

  "Flash Deal Wireless Buds": "/images/products/flash-deal-wireless-buds.png",
  "Limited Bundle Charge Kit": "/images/products/limited-bundle-charge-kit.png",
  "Weekend Special Backpack": "/images/products/weekend-special-backpack.png",
  "Clearance Desk Essentials Set":
    "/images/products/clearance-desk-essentials-set.png",
  "Promo Smart Band Lite": "/images/products/promo-smart-band-lite.png",
  "Bundle Home Starter Kit": "/images/products/bundle-home-starter-kit.png",
  "Seasonal Travel Pack": "/images/products/seasonal-travel-pack.png",
  "Value Power Adapter Duo": "/images/products/value-power-adapter-duo.png",
  "Deal of the Week Speaker": "/images/products/deal-of-the-week-speaker.png",
  "Member Exclusive Mouse": "/images/products/member-exclusive-mouse.png",
};

const BRANDS = [
  "Auralis",
  "HomeForge",
  "ChargeLab",
  "VoltRide",
  "DeskForm",
  "PlayPulse",
  "TrailCarry",
  "HydroDay",
  "PulseTrack",
  "NovaKit",
  "BrightLoom",
  "CoreNest",
] as const;

type Template = {
  category: string;
  names: string[];
  basePrice: number;
  priceSpread: number;
};

const TEMPLATES: Template[] = [
  {
    category: "smartphones-accessories",
    names: [
      "Wireless Noise-Cancelling Headphones",
      "Magnetic Wireless Charger 15W",
      "Portable Power Bank 10000mAh PD",
      "Smartwatch IP67 Fitness Edition",
      "Bluetooth Earbuds Pro",
      "USB-C Fast Charge Cable 2m",
      "Phone Tripod Stand Mini",
      "MagSafe Car Mount",
      "Screen Protector Glass Pack",
      "Silicone Phone Case Clear",
    ],
    basePrice: 18,
    priceSpread: 140,
  },
  {
    category: "kitchen-household",
    names: [
      "Compact Air Fryer 9L Digital Touch",
      "Dual Zone Air Fryer 23L XXL",
      "Electric Kettle Stainless 1.7L",
      "Blender Pro Glass Jug",
      "Toaster 2-Slice Premium",
      "Coffee Maker Drip 12 Cup",
      "Hand Mixer Compact",
      "Nonstick Pan Set 3pc",
      "Digital Kitchen Scale",
      "Vacuum Sealer Home",
    ],
    basePrice: 24,
    priceSpread: 280,
  },
  {
    category: "toys-gaming",
    names: [
      "Urban Electric Scooter Pro",
      "Pro Wireless Gaming Controller",
      "RGB Mechanical Keyboard",
      "Gaming Mouse Pad XL",
      "VR Headset Comfort Strap",
      "Building Blocks Creative Set",
      "Remote Control Race Car",
      "Puzzle Board 1000 Pieces",
      "Drone Mini Camera Edition",
      "Arcade Stick Retro",
    ],
    basePrice: 22,
    priceSpread: 520,
  },
  {
    category: "bags-backpacks",
    names: [
      "RPET Roll-Top Everyday Backpack",
      "Stainless Sports Bottle 750ml",
      "Laptop Sleeve 15 Inch",
      "Travel Duffel Bag 40L",
      "Crossbody City Sling",
      "Hiking Daypack 25L",
      "Drawstring Sport Bag",
      "Camera Shoulder Bag",
      "Weekender Canvas Bag",
      "Insulated Lunch Tote",
    ],
    basePrice: 14,
    priceSpread: 90,
  },
  {
    category: "computers-accessories",
    names: [
      "Ergonomic Vertical Wireless Mouse",
      "USB-C Hub 4-Port Multiport Adapter",
      "Laptop Stand Aluminum",
      "Wireless Keyboard Compact",
      "Monitor Light Bar",
      "Webcam Full HD 1080p",
      "External SSD Enclosure",
      "Desk Cable Organizer",
      "USB Microphone Condenser",
      "Portable Monitor 15.6",
    ],
    basePrice: 16,
    priceSpread: 220,
  },
  {
    category: "top-offers",
    names: [
      "Flash Deal Wireless Buds",
      "Limited Bundle Charge Kit",
      "Weekend Special Backpack",
      "Clearance Desk Essentials Set",
      "Promo Smart Band Lite",
      "Bundle Home Starter Kit",
      "Seasonal Travel Pack",
      "Value Power Adapter Duo",
      "Deal of the Week Speaker",
      "Member Exclusive Mouse",
    ],
    basePrice: 12,
    priceSpread: 100,
  },
];

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function imageForName(nameBase: string) {
  return (
    PRODUCT_IMAGE_BY_NAME[nameBase] ?? "/images/products/wireless-headphones.png"
  );
}

function galleryForImage(image: string) {
  const file = image.split("/").pop() ?? "wireless-headphones.png";
  const base = file.replace(/\.png$/i, "");
  return [
    image,
    `/images/products/gallery/${base}-2.png`,
    `/images/products/gallery/${base}-3.png`,
    `/images/products/gallery/${base}-4.png`,
  ];
}

export function generateProducts(count = 1000): DemoProduct[] {
  const products: DemoProduct[] = [];

  for (let i = 1; i <= count; i += 1) {
    const template = TEMPLATES[(i - 1) % TEMPLATES.length];
    const nameBase = template.names[(i - 1) % template.names.length];
    const brand = BRANDS[(i - 1) % BRANDS.length];
    const image = imageForName(nameBase);
    const images = galleryForImage(image);
    const random = seededRandom(i);
    const price = roundMoney(template.basePrice + random * template.priceSpread);
    const hasDiscount = random > 0.35;
    const compareAtPrice = hasDiscount
      ? roundMoney(price * (1.12 + random * 0.35))
      : undefined;
    const stockLeft = Math.max(1, Math.floor(random * 40) + 1);
    const edition = Math.ceil(i / TEMPLATES.length);
    const name = edition === 1 ? nameBase : `${nameBase} — Edition ${edition}`;

    products.push({
      id: `p${i}`,
      slug: `${nameBase
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-e${edition}-${i}`,
      name,
      brand,
      price,
      compareAtPrice,
      image,
      images,
      stockLeft,
      rating: roundMoney(3.6 + random * 1.4),
      category: template.category,
      featured: i <= 40 || random > 0.82,
    });
  }

  return products;
}

export const demoCategories: DemoCategory[] = [
  {
    id: "1",
    name: "Top Offers",
    slug: "top-offers",
    image: "/images/products/flash-deal-wireless-buds.png",
    productCount: 0,
  },
  {
    id: "2",
    name: "Smartphones & Accessories",
    slug: "smartphones-accessories",
    image: "/images/products/smartwatch.png",
    productCount: 0,
  },
  {
    id: "3",
    name: "Kitchen & Household",
    slug: "kitchen-household",
    image: "/images/products/air-fryer-9l.png",
    productCount: 0,
  },
  {
    id: "4",
    name: "Toys & Gaming",
    slug: "toys-gaming",
    image: "/images/products/gaming-controller.png",
    productCount: 0,
  },
  {
    id: "5",
    name: "Bags & Backpacks",
    slug: "bags-backpacks",
    image: "/images/products/rolltop-backpack.png",
    productCount: 0,
  },
  {
    id: "6",
    name: "Computers & Accessories",
    slug: "computers-accessories",
    image: "/images/products/usb-c-hub.png",
    productCount: 0,
  },
];

export const demoProducts = generateProducts(1000);

for (const category of demoCategories) {
  category.productCount = demoProducts.filter(
    (product) => product.category === category.slug
  ).length;
}

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Blog & News", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
