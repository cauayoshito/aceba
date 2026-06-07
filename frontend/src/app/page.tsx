"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <p className="mt-2 max-w-2xl text-brand-100">
          Produtos de pequenos negócios. Monte seu carrinho, finalize a compra e acompanhe seus
          pedidos — tudo conectado ao backend Spring Boot.
        </p>
      </section>

      {loading && <p className="text-slate-500">Carregando produtos…</p>}
      {error && (
        <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-slate-500">Nenhum produto cadastrado ainda.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
