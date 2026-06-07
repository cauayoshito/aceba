"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api, formatCurrency } from "@/lib/api";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { lines, total, clear } = useCart();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send unauthenticated users to login, preserving the destination.
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/checkout");
  }, [loading, user, router]);

  if (loading || !user) return <p className="text-slate-500">Carregando…</p>;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold">Nada para finalizar</h1>
        <Link href="/" className="btn-primary mt-6">
          Ver catálogo
        </Link>
      </div>
    );
  }

  async function placeOrder() {
    if (!user?.customerId) {
      setError(
        "Sua conta não possui um perfil de cliente. Faça login com uma conta de cliente para comprar.",
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.createOrder(
        user.customerId,
        lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      );
      clear();
      router.push(`/orders?placed=${order.id}`);
    } catch (err: any) {
      setError(err.message || "Não foi possível finalizar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Resumo do pedido</h2>
        <ul className="divide-y divide-slate-100">
          {lines.map((l) => (
            <li key={l.product.id} className="flex justify-between py-2 text-sm">
              <span>
                {l.quantity}× {l.product.name}
              </span>
              <span className="font-medium">{formatCurrency(l.product.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          Comprando como <strong>{user.username}</strong> ({user.email})
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button onClick={placeOrder} disabled={submitting} className="btn-primary mt-6 w-full">
          {submitting ? "Finalizando…" : `Confirmar pedido — ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  );
}
