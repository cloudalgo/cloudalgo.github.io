export interface HomeProductCard {
  id: string;
  title: string;
  status: 'ga' | 'preview' | 'beta';
  excerpt: string;
  order: number;
}

export interface HomeBlogCard {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Salesforce' | 'Heroku' | 'MuleSoft' | 'AWS' | 'Product';
  date: string; // ISO 8601 string — Date objects don't survive Astro island prop serialization
  readTime: number;
}
