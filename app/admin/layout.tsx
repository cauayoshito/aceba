import type { Metadata } from 'next'
import '../admin.css'

export const metadata: Metadata = {
  title: 'ACEBA · Painel Administrativo',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
