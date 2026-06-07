"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stockQuantity <= 0;

  function handleAdd() {
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="card flex flex-col p-4">
      <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-gradient-to-br from-brand-50 to-slate-100 text-4xl">
        📦
      </div>
      <h3 className="font-semibold text-slate-900">{product.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{product.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</span>
        {outOfStock ? (
          <span className="badge bg-red-100 text-red-700">Esgotado</span>
        ) : (
          <span className="badge bg-emerald-100 text-emerald-700">{product.stockQuantity} em estoque</span>
        )}
      </div>
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="btn-primary mt-3 w-full"
      >
        {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
