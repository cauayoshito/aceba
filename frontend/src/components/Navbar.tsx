"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="text-xl">🛒</span>
          <span>OrderFlow</span>
          <span className="hidden text-slate-400 sm:inline">Commerce Cloud</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="text-sm text-slate-600 hover:text-brand-700">
            Catálogo
          </Link>

          <Link href="/cart" className="relative text-sm text-slate-600 hover:text-brand-700">
            Carrinho
            {count > 0 && (
              <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          {user && (
            <Link href="/orders" className="text-sm text-slate-600 hover:text-brand-700">
              Meus pedidos
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-brand-700 hover:underline">
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-slate-500 sm:inline">Olá, {user.username}</span>
              <button onClick={handleLogout} className="btn-secondary py-1.5">
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary py-1.5">
                Entrar
              </Link>
              <Link href="/register" className="btn-primary py-1.5">
                Criar conta
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
