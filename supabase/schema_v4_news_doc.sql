-- ================================================================
-- ACEBA · Schema v4: documento para download em notícias/parcerias
-- Executar no SQL Editor do Supabase (projeto ACEBA).
-- Seguro de rodar mais de uma vez (idempotente).
-- ================================================================

alter table public.news add column if not exists doc_url   text;
alter table public.news add column if not exists doc_label text;

-- Nada mais é necessário: o bucket 'documents' e as policies de upload/leitura
-- já existem (schema base). O download usa a URL pública do bucket.
