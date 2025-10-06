"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Image from "next/image";

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
}

interface Subcategory {
  _id: string;
  title: string;
  slug: { current: string };
  parent: { slug: { current: string } };
  category?: {
    slug?: {
      current?: string;
    };
  };
}

interface Product {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category?: { slug: { current: string } };
  subcategory?: { slug: { current: string } };
  imageUrl?: string;
}

export default function ProdottiLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ uso l'operatore opzionale per evitare l'errore TS
  const [search, setSearch] = useState(searchParams?.get("q") ?? "");
  const [categoria, setCategoria] = useState(searchParams?.get("categoria") ?? "");
  const [sottocategoria, setSottocategoria] = useState(searchParams?.get("sottocategoria") ?? "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [cats, subs, prods] = await Promise.all([
        fetch("/api/categories").then((res) => res.json()),
        fetch("/api/subcategories").then((res) => res.json()),
        fetch("/api/products").then((res) => res.json()),
      ]);
      setCategories(cats);
      setSubcategories(subs);
      setProducts(prods);
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (categoria) query.set("categoria", categoria);
    if (sottocategoria) query.set("sottocategoria", sottocategoria);
    router.push(`/prodotti?${query.toString()}`);
    setShowFilters(false);
  };

  const filteredProducts = products.filter((prod) => {
    const matchSearch = search === "" || prod.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoria === "" || prod.category?.slug.current === categoria;
    const matchSub = sottocategoria === "" || prod.subcategory?.slug.current === sottocategoria;
    return matchSearch && matchCat && matchSub;
  });

  return (
    <div className="relative w-full min-h-screen bg-white text-gray-900">
      {/* Pulsante lente */}
      <button
        onClick={() => setShowFilters((prev) => !prev)}
        className="fixed top-1/2 right-4 z-50 transform -translate-y-1/2 bg-[#C73A3A] text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
      >
        {showFilters ? <X size={24} /> : <Search size={24} />}
      </button>

      {/* Sidebar filtri */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4 }}
            className="fixed top-1/2 right-4 sm:right-20 transform -translate-y-1/2 bg-white border border-gray-300 rounded-2xl shadow-2xl p-4 sm:p-6 z-40 w-[90vw] sm:w-[400px] max-h-[80vh] overflow-y-auto space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca prodotto..."
                className="border rounded-xl p-3 w-full text-sm focus:ring-2 focus:ring-[#C73A3A] focus:border-[#C73A3A]"
              />

              <select
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  setSottocategoria("");
                }}
                className="border rounded-xl p-3 w-full text-sm bg-white focus:ring-2 focus:ring-[#C73A3A] focus:border-[#C73A3A]"
              >
                <option value="">Tutte le categorie</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug.current}>
                    {cat.title}
                  </option>
                ))}
              </select>

              <select
                value={sottocategoria}
                onChange={(e) => setSottocategoria(e.target.value)}
                className="border rounded-xl p-3 w-full text-sm bg-white focus:ring-2 focus:ring-[#C73A3A] focus:border-[#C73A3A]"
                disabled={!categoria}
              >
                <option value="">Tutte le sottocategorie</option>
                {subcategories
                  .filter((sub) => sub.category?.slug?.current === categoria)
                  .map((sub) => (
                    <option key={sub._id} value={sub.slug.current}>
                      {sub.title}
                    </option>
                  ))}
              </select>
            </form>

            {/* Box risultati */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition bg-gray-50"
                >
                  <div className="relative w-full h-32 mb-2 rounded overflow-hidden">
                    <Image
                      src={
                        prod.imageUrl && prod.imageUrl !== ""
                          ? prod.imageUrl
                          : "/A_placeholder_image_displays_a_centered_graphic_co.png"
                      }
                      alt={prod.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-[#C73A3A] mb-1">{prod.title}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{prod.description}</p>
                  <button
                    onClick={() =>
                      router.push(
                        `/prodotti/${prod.category?.slug.current}/${prod.subcategory?.slug.current}/${prod.slug}`
                      )
                    }
                    className="w-full mt-2 px-4 py-2 bg-black text-white font-semibold rounded-tr-none rounded-bl-none rounded-tl-none rounded-br-3xl hover:bg-gray-800 hover:scale-105 transition-transform duration-200 text-center text-sm"
                  >
                    Vai al prodotto
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenuto pagina */}
      <div>{children}</div>
    </div>
  );
}