// Which products a visitor can see. A product file with `published: false` is switched off: its page is
// not built, and every list, count, link and sentence that names products leaves it out. Its content file,
// page copy (src/data/product-pages.ts) and images stay in place, so setting `published: true` again puts
// it back exactly as it was. AlgoBridge was switched off this way on 2026-10-17, temporarily.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Product = CollectionEntry<'products'>;

/** The products a visitor can see, in catalogue order. */
export async function listedProducts(): Promise<Product[]> {
  return (await getCollection('products', ({ data }) => data.published)).sort((a, b) => a.data.order - b.data.order);
}

/** A product reference (a service's `proves`), or undefined when the product is switched off. */
export async function listedProduct(ref: { collection: 'products'; id: string } | undefined): Promise<Product | undefined> {
  if (!ref) return undefined;
  const p = await getEntry(ref);
  return p && p.data.published ? p : undefined;
}

export { countWord } from './listing-words';
