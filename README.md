# ACEBA · Site Institucional + Painel Admin

Next.js 15 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## Setup local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencher `.env.local` com os dados do projeto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Rodar localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Supabase

### Rodar schema

No SQL Editor do Supabase, execute o conteúdo de `supabase/schema.sql`.

### Criar usuário admin

1. Crie o usuário no **Authentication → Users** do Supabase  
2. Execute no SQL Editor:

```sql
insert into public.admin_users (id, email)
select id, email
from auth.users
where email = 'SEU_EMAIL_AQUI'
on conflict (id) do update set email = excluded.email;
```

### Buckets de Storage

Crie os buckets no Supabase Storage (os nomes já estão no schema.sql):
- `logos` (public)
- `gallery` (public)
- `documents` (public)

---

## Deploy na Vercel

1. Conecte o repositório à Vercel
2. Adicione as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático a cada push na branch main

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Site público |
| `/admin` | Dashboard admin (protegido) |
| `/admin/login` | Login admin |
| `/admin/parcerias` | CRUD de parcerias |
| `/admin/noticias` | CRUD de notícias |
| `/admin/galeria` | CRUD de galeria |
| `/admin/configuracoes` | Configurações do site |

---

## Stack

- **Next.js 15** App Router
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (@supabase/supabase-js + @supabase/ssr)
- **Vercel** para deploy
