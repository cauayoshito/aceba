import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ACEBA – Associação Comunitária de Educação para o Bem-Estar',
  description: 'Transformando vidas através da educação, cultura e esporte em Camaçari/BA.',
  icons: { icon: '/logos/aceba.png' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
