import type { Metadata } from 'next'
import './site.css'
import SiteClient from './SiteClient'

export const metadata: Metadata = {
  title: 'ACEBA: Educar é cuidar. Há 23 anos em Vila de Abrantes, Camaçari · BA',
  description: 'A ACEBA mantém a Creche Esperança da Estiva, o Projeto de Educação Complementar e o Costurando Sonhos. Desde 2002, em Vila de Abrantes, Camaçari – Bahia.',
  keywords: 'ACEBA, ONG Camaçari, Vila de Abrantes, doação, educação infantil, creche comunitária, Esperança da Estiva, Buris de Abrantes, Bahia',
  openGraph: {
    type: 'website',
    url: 'https://aceba.org.br/',
    title: 'ACEBA: Educar é cuidar. Há 23 anos em Vila de Abrantes.',
    description: '160 crianças em educação integral, 80 adolescentes no contraturno, 40 mulheres construindo renda. Desde 2002, em Camaçari – Bahia.',
    images: ['/images/piquenique-literario-geral.jpg'],
    locale: 'pt_BR',
    siteName: 'ACEBA',
  },
}

export default function HomePage() {
  return <SiteClient />
}
