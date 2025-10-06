"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
}

export default function ProductFilter({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [sottocategoria, setSottocategoria] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (categoria) query.set("categoria", categoria);
    if (sottocategoria) query.set("sottocategoria", sottocategoria);

    router.push(`/prodotti?${query.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full px-6 md:px-20 pt-24 pb-8 bg-white space-y-4"
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cerca prodotto..."
        className="border border-gray-300 rounded p-2 w-full"
      />

      <select
        value={categoria}
        onChange={(e) => {
          setCategoria(e.target.value);
          setSottocategoria(""); // reset sottocategoria quando cambia categoria
        }}
        className="border border-gray-300 rounded p-2 w-full"
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
        className="border border-gray-300 rounded p-2 w-full"
        disabled={!categoria}
      >
        <option value="">Tutte le sottocategorie</option>
        {subcategories
          .filter((sub) => sub.parent?.slug?.current === categoria)
          .map((sub) => (
            <option key={sub._id} value={sub.slug.current}>
              {sub.title}
            </option>
          ))}
      </select>

      <button
        type="submit"
        className="w-full md:w-auto px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Cerca
      </button>
    </form>
  );
}
