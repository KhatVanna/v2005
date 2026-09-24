export type { CatalogCategory, CatalogProduct, DemoCategory, DemoProduct } from "@/data/demo-catalog.types";
export { navLinks } from "@/lib/catalog-api";

/**
 * Legacy in-memory catalog kept only for reference during migration.
 * Storefront pages now load from Laravel/Neon via `@/lib/catalog-api`.
 */
export const demoProducts: never[] = [];
export const demoCategories: never[] = [];
