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

**Pagamentos**
- Checkout com **Stripe** (PaymentIntent + Stripe Elements)
- Webhook que atualiza o pedido para `PAID` / `PAYMENT_FAILED`

**Tempo real & notificações**
- Status do pedido **em tempo real** via WebSocket (STOMP/SockJS)
- E-mails transacionais via **Resend** (confirmação, mudança de status, boas-vindas)

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
| Pagamentos | Stripe (stripe-java + Stripe.js / React Elements) |
| Tempo real | WebSocket STOMP + SockJS (`@stomp/stompjs`) |
| E-mail | Resend (Next.js Route Handlers) |
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
| `STRIPE_SECRET_KEY` | backend | — | Habilita pagamentos. Sem ela, `create-intent` retorna 503. |
| `STRIPE_WEBHOOK_SECRET` | backend | — | Segredo para validar a assinatura do webhook Stripe. |
| `STRIPE_PUBLISHABLE_KEY` | backend/frontend | — | Chave pública do Stripe (usada no navegador). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | frontend | — | Chave pública do Stripe inlined no bundle do navegador. |
| `RESEND_API_KEY` | frontend | — | Habilita e-mails transacionais. Sem ela, as rotas logam e pulam o envio. |
| `RESEND_FROM_EMAIL` | frontend | `onboarding@resend.dev` | Remetente dos e-mails. |
| `INTERNAL_API_SECRET` | frontend | — | Protege as rotas de e-mail internas (vazio = aberto para o navegador em dev). |
| `NEXT_PUBLIC_APP_URL` | frontend | `http://localhost:3000` | URL base usada nos links dos e-mails. |
| `NEXT_PUBLIC_WS_URL` | frontend | `ws://localhost:8080/ws` | Endpoint WebSocket (STOMP/SockJS) para status em tempo real. |
| `JWT_SECRET` | backend | dev secret | Segredo de assinatura dos tokens (troque em produção). |
| `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` | backend | local Postgres | Conexão com o banco. |
| `APP_CORS_ALLOWED_ORIGINS` | backend | `http://localhost:3000` | Origens liberadas para o CORS. |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | `http://localhost:8080` | URL da API usada pelo navegador. |

---

## 💳 Stripe Integration

Pagamentos usam o fluxo **PaymentIntent + Stripe Elements**, com um webhook que
reconcilia o pagamento de volta ao pedido.

### 1. Obter as chaves

No [dashboard.stripe.com](https://dashboard.stripe.com) (modo de teste), em
**Developers → API keys**, copie:
- **Publishable key** (`pk_test_...`)
- **Secret key** (`sk_test_...`)

### 2. Configurar variáveis de ambiente

Backend:
```bash
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_PUBLISHABLE_KEY=pk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...   # gerado no passo 4
```
Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Fluxo de pagamento

1. No checkout, o pedido é criado (`POST /api/customer/orders`).
2. O frontend chama `POST /api/payment/create-intent { orderId }` e recebe o `clientSecret`.
3. O `PaymentElement` confirma o pagamento; o Stripe redireciona para `/orders/confirmation`.
4. O Stripe envia `payment_intent.succeeded` para o webhook, que marca o pedido como `PAID`.

### 4. Testar localmente com a Stripe CLI

```bash
# encaminha eventos do Stripe para o webhook local
stripe listen --forward-to localhost:8080/api/payment/webhook
# copie o "whsec_..." exibido para STRIPE_WEBHOOK_SECRET e reinicie o backend
```

Use o cartão de teste **4242 4242 4242 4242**, qualquer data futura, qualquer CVC e CEP.

> Sem `STRIPE_SECRET_KEY` o endpoint `create-intent` retorna **503** e o resto do app
> continua funcionando.

---

## 📧 Email Notifications

E-mails transacionais são enviados pelo **Resend** a partir de **Route Handlers do
Next.js** (`/api/email/*`). Os templates são strings HTML em
`frontend/src/emails/`.

### 1. Obter a API key

Em [resend.com](https://resend.com) → **API Keys**, crie uma chave (`re_...`).

### 2. Domínio de envio

- **Dev:** use `onboarding@resend.dev` como remetente — funciona **sem domínio
  verificado** (entrega para o e-mail dono da conta Resend).
- **Produção:** verifique seu domínio no Resend e use algo como `noreply@seudominio.com`.

### 3. E-mails disparados

| E-mail | Quando | Rota | Proteção |
|--------|--------|------|----------|
| Boas-vindas | Após cadastro bem-sucedido | `POST /api/email/welcome` | Pública |
| Confirmação de pedido | Após pagamento aprovado (página de confirmação do Stripe) | `POST /api/email/order-confirmation` | `x-internal-secret`* |
| Atualização de status | Quando o admin altera o status de um pedido | `POST /api/email/order-status` | `x-internal-secret`* |

\* A proteção é **opcional**: se `INTERNAL_API_SECRET` não estiver definido, as
rotas aceitam chamadas do navegador (modo demo). Quando definido, exigem o header
`x-internal-secret` — restringindo-as a chamadas server-to-server (ex.: backend
Java ou webhook do Stripe).

### 4. Variáveis de ambiente

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_SECRET=         # opcional
```

> **Graceful degradation:** sem `RESEND_API_KEY`, as rotas logam
> `"Email not sent: RESEND_API_KEY not configured"` e retornam
> `{ success: true, skipped: true }` — checkout, cadastro e mudança de status
> continuam funcionando normalmente.

---

## ⚡ Real-time Updates

O status dos pedidos é atualizado **em tempo real** via **STOMP over SockJS**.

### Como funciona

- O backend expõe um endpoint WebSocket em `/ws` (com fallback SockJS) e um
  broker in-memory que publica em `/topic/orders/{id}`.
- Sempre que o status de um pedido muda (admin altera o status, ou um webhook do
  Stripe marca como `PAID` / `PAYMENT_FAILED`), o `OrderService` envia um
  `OrderStatusEvent` para `/topic/orders/{id}`.
- No frontend, o hook `useOrderStatus(orderId)` conecta via STOMP/SockJS,
  assina o tópico do pedido e recebe as mudanças instantaneamente
  (reconexão automática com backoff de 3s).

### Páginas com atualização em tempo real

| Página | O que mostra |
|--------|--------------|
| `/orders` (Meus pedidos) | Indicador "ao vivo" + status atual por pedido |
| `/orders/[id]` (Detalhe do pedido) | Stepper completo do status + "última atualização há Xs" |

> Experimente: abra `/orders/{id}` como cliente em uma aba e, em outra, mude o
> status pelo painel admin (`/admin/orders`) — a página do cliente atualiza
> sozinha.

### Variável de ambiente

```
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

---

## 🧪 Testes

```bash
cd backend
mvn test        # 18 testes (unitários + integração em H2: pagamento e WebSocket)
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
