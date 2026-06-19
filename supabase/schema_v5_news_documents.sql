-- ================================================================
-- ACEBA · Schema v5: múltiplos documentos por notícia/parceria
-- Executar no SQL Editor do Supabase (projeto ACEBA).
-- Idempotente: seguro rodar mais de uma vez.
-- ================================================================

-- 1) Coluna que guarda a LISTA de documentos: [{ "label": "...", "url": "..." }]
alter table public.news add column if not exists documents jsonb default '[]'::jsonb;

-- (As colunas antigas doc_url / doc_label podem permanecer; não são mais usadas.)

-- 2) Garantir que o bucket 'documents' existe, é público, aceita PDFs grandes
--    e não restringe tipo de arquivo. (Causa comum de falha no upload.)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

update storage.buckets
set public = true,
    file_size_limit = 52428800,   -- 50 MB por arquivo
    allowed_mime_types = null     -- sem restrição de tipo
where id = 'documents';

-- 3) Reforçar as policies de storage (leitura pública + upload por admin)
drop policy if exists "Public can read ACEBA storage" on storage.objects;
create policy "Public can read ACEBA storage"
on storage.objects for select to anon, authenticated
using (bucket_id in ('logos', 'gallery', 'documents'));

drop policy if exists "Admins can upload ACEBA storage" on storage.objects;
create policy "Admins can upload ACEBA storage"
on storage.objects for insert to authenticated
with check (bucket_id in ('logos', 'gallery', 'documents') and public.is_admin());
