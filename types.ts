export type Office = {
  _id: string;
  name: string | { en?: string; it?: string };
  address: string | { en?: string; it?: string };
  openingHours: { [key: string]: string }; // sempre oggetto
};

export type Category = {
  _id: string;
  title: string;
  description?: string;
  slug: { current: string };
  imageUrl?: string;
};

export type Subcategory = {
  _id: string;
  title: string;
  slug: { current: string };
  parent?: { slug: { current: string } };
  category?: { slug?: { current?: string } };
};

export type Product = {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  category?: { slug: { current: string } };
  subcategory?: { slug: { current: string } };
  imageUrl?: string;
};