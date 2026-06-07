import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "OrderFlow Commerce Cloud",
  description: "Plataforma de pedidos para pequenos negócios — catálogo, carrinho, pedidos e painel admin com IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
            <footer className="mx-auto w-full max-w-6xl px-4 py-10 text-center text-sm text-slate-400">
              OrderFlow Commerce Cloud — projeto de portfólio full stack (Spring Boot + Next.js + IA)
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
