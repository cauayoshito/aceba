# OrderFlow Commerce Cloud

> Plataforma completa de pedidos para pequenos negócios — **backend Java/Spring Boot**, **frontend Next.js/TypeScript** e um **módulo de IA** com a API da Claude (Anthropic).

Projeto full stack de portfólio: catálogo de produtos, carrinho, checkout, histórico de pedidos, painel administrativo com dashboard de métricas e recursos de IA (geração de descrições, resumo de vendas e sugestões de reposição de estoque).

---

## ✨ Funcionalidades

**Loja (cliente)**
- Cadastro e login (JWT)
- Catálogo de produtos com estoque
- Carrinho de compras (persistido no navegador)
- Checkout vinculado à conta do cliente
- Histórico de "Meus pedidos" com status

**Painel administrativo**
- Dashboard: total de vendas, pedidos por status, produtos com estoque baixo e pedidos recentes
- CRUD de produtos (com estoque)
- Gestão de status de pedidos (com regras de transição)
- **IA (Claude):** gerar descrição de produto, resumir vendas da semana, sugerir ações para estoque baixo

---

## 🏗️ Arquitetura

```
┌──────────────────────┐      HTTP/JSON (JWT)      ┌──────────────────────────┐
│   Next.js Frontend   │ ────────────────────────▶ │   Spring Boot REST API   │
│  (App Router, TS,    │ ◀──────────────────────── │  (Security + JWT, JPA)   │
│   Tailwind)          │                            │                          │
│  :3000               │                            │  ── AI module ──▶ Claude │
└──────────────────────┘                            └────────────┬─────────────┘
                                                                  │ JDBC
                                                          ┌───────▼────────┐
                                                          │  PostgreSQL    │
                                                          │  :5432         │
                                                          └────────────────┘
```

| Camada | Tecnologias |
|--------|-------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Java 17, Spring Boot 3.2, Spring Security + JWT, Spring Data JPA |
| Banco | PostgreSQL 15 (H2 em memória nos testes) |
| IA | API da Claude (`claude-opus-4-8`) via `RestClient` |
| Infra | Docker Compose, OpenAPI/Swagger |

---

## 🚀 Como rodar

### Opção A — Docker Compose (recomendado)

```bash
# (opcional) habilite a IA exportando sua chave da Anthropic
export ANTHROPIC_API_KEY=sk-ant-...

docker compose up --build
```

- Loja: <http://localhost:3000>
- API (Swagger): <http://localhost:8080/swagger-ui.html>

### Opção B — Manual (desenvolvimento)

**Banco** (via Docker):
```bash
docker run --name ofcc-pg -e POSTGRES_DB=orderflow_db -e POSTGRES_USER=orderflow \
  -e POSTGRES_PASSWORD=orderflow -p 5432:5432 -d postgres:15
```

**Backend:**
```bash
cd backend
export ANTHROPIC_API_KEY=sk-ant-...   # opcional, habilita a IA
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### Credenciais de demonstração

Um usuário admin e um catálogo inicial são criados automaticamente:

| Usuário | Senha | Papel |
|---------|-------|-------|
| `admin` | `admin123` | ADMIN |

Crie contas de cliente pela tela de cadastro.

---

## ⚙️ Variáveis de ambiente

| Variável | Onde | Padrão | Descrição |
|----------|------|--------|-----------|
| `ANTHROPIC_API_KEY` | backend | — | Habilita o módulo de IA. Sem ela, os endpoints de IA retornam 503. |
| `ANTHROPIC_MODEL` | backend | `claude-opus-4-8` | Modelo da Claude usado nas features de IA. |
| `JWT_SECRET` | backend | dev secret | Segredo de assinatura dos tokens (troque em produção). |
| `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` | backend | local Postgres | Conexão com o banco. |
| `APP_CORS_ALLOWED_ORIGINS` | backend | `http://localhost:3000` | Origens liberadas para o CORS. |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | `http://localhost:8080` | URL da API usada pelo navegador. |

---

## 🧪 Testes

```bash
cd backend
mvn test        # 14 testes (unitários + integração em H2)
```

```bash
cd frontend
npm run build   # compila e valida os tipos (tsc)
```

---

## 📁 Estrutura do projeto

```
.
├── backend/        # API Spring Boot (entities, DTOs, services, controllers, security, IA)
├── frontend/       # App Next.js (catálogo, carrinho, checkout, pedidos, admin)
├── docs/           # Documentação de uso e da API
└── docker-compose.yml
```

---

## 📚 Documentação

- [docs/USAGE.md](docs/USAGE.md) — guia de uso passo a passo (fluxos de cliente e admin)
- [docs/API.md](docs/API.md) — referência dos endpoints da API
- Swagger UI: <http://localhost:8080/swagger-ui.html>

---

## 🗺️ Próximos passos (ideias)

- Pagamento (Stripe/Pix) e geração de nota
- Imagens reais de produto (upload)
- Restringir pedidos ao próprio cliente autenticado (ownership) e paginação
- CI/CD e deploy (Render/Fly/Vercel)

---

> Construído como projeto de portfólio full stack. Código limpo, organização clara e foco em boas práticas.
