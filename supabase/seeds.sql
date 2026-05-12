-- ================================================================
-- ACEBA: Seeds iniciais para a tabela news
-- Execute no SQL Editor do Supabase após rodar schema.sql
-- ================================================================

insert into public.news (title, category, cover_url, excerpt, link_url, published_at, is_active)
values
  (
    'Maquie e Crie: jovens de Vila de Abrantes aprendem maquiagem artística com o Boticário',
    'PARCERIA EM DESTAQUE',
    'https://www.portalabrantes.com.br/images/noticias/36461/0_08122023084819.jpeg',
    'Em parceria com o Grupo Boticário, a Creche Esperança da Estiva ofereceu curso de maquiagem artística a 50 adolescentes da comunidade — uma ponte entre arte, identidade e geração de renda.',
    'https://www.instagram.com/crecheesperancadaestiva/',
    '2023-12-08',
    true
  ),
  (
    'Piquenique Literário: quando a leitura vira celebração coletiva',
    'EDUCAÇÃO',
    '/images/piquenique-literario-geral.jpg',
    'As crianças do Projeto de Educação Complementar transformaram o pátio em um espaço de histórias, poesia e descoberta. Uma tarde inteira dedicada ao prazer de ler em voz alta.',
    'https://www.instagram.com/crecheesperancadaestiva/',
    '2024-09-15',
    true
  ),
  (
    'Capoeira na ACEBA: raízes, movimento e identidade cultural',
    'CULTURA',
    '/images/capoeira-roda-area-externa.jpg',
    'A roda de capoeira entrou para o calendário permanente da ACEBA como ferramenta de educação corporal e valorização da ancestralidade africana e brasileira.',
    'https://www.instagram.com/crecheesperancadaestiva/',
    '2024-06-20',
    true
  )
on conflict do nothing;
