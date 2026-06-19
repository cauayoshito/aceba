import type { NewsItem } from '@/lib/types'

export const INSTAGRAM = 'https://www.instagram.com/crecheesperancadaestiva/'

// Conteúdo de demonstração — só aparece quando a tabela `news` está vazia.
// Compartilhado entre a home (SiteClient) e a página de matéria (/noticias/[id]).
export const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'fb-1',
    title: 'Maquie e Crie: jovens de Vila de Abrantes aprendem maquiagem artística com o Boticário',
    category: 'PARCERIA EM DESTAQUE',
    cover_url: 'https://www.portalabrantes.com.br/images/noticias/36461/0_08122023084819.jpeg',
    excerpt: 'Em parceria com o Grupo Boticário, a Creche Esperança da Estiva ofereceu curso de maquiagem artística a 50 adolescentes da comunidade — uma ponte entre arte, identidade e geração de renda.',
    content: 'Em parceria com o Grupo Boticário, a Creche Esperança da Estiva ofereceu curso de maquiagem artística a 50 adolescentes da comunidade.\n\nA iniciativa uniu arte, identidade e geração de renda, abrindo caminho para que jovens de Vila de Abrantes descubram novas possibilidades profissionais. Mais do que técnica, o curso trabalhou autoestima e protagonismo.',
    link_url: INSTAGRAM,
    published_at: '2023-12-08',
    is_active: true,
    created_at: '',
  },
  {
    id: 'fb-2',
    title: 'Piquenique Literário: quando a leitura vira celebração coletiva',
    category: 'EDUCAÇÃO',
    cover_url: '/images/piquenique-literario-geral.jpg',
    excerpt: 'As crianças do Projeto de Educação Complementar transformaram o pátio em um espaço de histórias, poesia e descoberta. Uma tarde inteira dedicada ao prazer de ler em voz alta.',
    content: 'As crianças do Projeto de Educação Complementar transformaram o pátio em um espaço de histórias, poesia e descoberta.\n\nFoi uma tarde inteira dedicada ao prazer de ler em voz alta, compartilhar livros e celebrar a literatura como experiência coletiva.',
    link_url: INSTAGRAM,
    published_at: '2024-09-15',
    is_active: true,
    created_at: '',
  },
  {
    id: 'fb-3',
    title: 'Capoeira na ACEBA: raízes, movimento e identidade cultural',
    category: 'CULTURA',
    cover_url: '/images/capoeira-roda-area-externa.jpg',
    excerpt: 'A roda de capoeira entrou para o calendário permanente da ACEBA como ferramenta de educação corporal e valorização da ancestralidade africana e brasileira.',
    content: 'A roda de capoeira entrou para o calendário permanente da ACEBA como ferramenta de educação corporal e valorização da ancestralidade africana e brasileira.\n\nMais do que esporte, a capoeira ensina ritmo, disciplina, história e pertencimento às novas gerações da comunidade.',
    link_url: INSTAGRAM,
    published_at: '2024-06-20',
    is_active: true,
    created_at: '',
  },
]
