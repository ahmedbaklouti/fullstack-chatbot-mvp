# Fullstack Chatbot MVP (Technical Assessment)

A small, interview-oriented fullstack chatbot built as a TypeScript monorepo.

The goal is to demonstrate clean separation of concerns, strong frontend/backend consistency, and pragmatic engineering while keeping the implementation lightweight.

## Tech Stack

**Backend**
- NestJS (TypeScript)
- Prisma + PostgreSQL
- Validation with `class-validator` + `class-transformer`

**Frontend**
- React + Vite + TypeScript
- TanStack Query (React Query) for server-state

**Tooling / Monorepo**
- pnpm workspaces
- `packages/shared` for shared types and constraints
- Jest tests (backend)
- Docker Compose for local Postgres

## Features (Implemented)

- Keyword-based response engine with:
  - multi-intent matching (can answer multiple questions in one message)
  - greeting priority (`hello` / `hi` / `hey`)
- PostgreSQL persistence:
  - stores user messages and bot responses
  - stores chatbot rules used by the matcher
- Chat history on refresh (`GET /chat/history`)
- React Query integration:
  - cached chat history (`['chat-history']`)
  - optimistic UI updates for user messages + bot responses
  - query retries (2) for transient issues; mutation retries disabled to avoid duplicates
- UX:
  - “…” loading bubble while waiting for history or bot response
  - auto-scroll to the latest message
  - input disabled while history is loading and while sending
- Validation & robustness:
  - backend DTO validation + trimming + max length
  - frontend max length guard for better UX
  - request timeout + friendly network/offline error messages

## Architecture

### Monorepo Layout

```
apps/
  backend/    # NestJS + Prisma + PostgreSQL
  frontend/   # React + Vite + React Query
packages/
  shared/     # Shared TS contracts (types + constants)
```

### Backend (NestJS)

- Layered flow: **Controller → Service → Repository → Prisma**
  - Controller exposes HTTP endpoints.
  - Service orchestrates business logic and persistence.
  - Repository holds Prisma queries.
  - PrismaService encapsulates Prisma v7 adapter initialization and lifecycle.
- Global request validation via `ValidationPipe` (whitelist + transform).

### Frontend (React + React Query)

- **`src/api/chatApi.ts`**: minimal fetch wrapper with timeout + friendly errors
- **`src/hooks/useChatHistory.ts`**: `useQuery(['chat-history'])`
- **`src/hooks/useSendMessage.ts`**: `useMutation(sendChatMessage)` with optimistic updates + history refetch on success
- Components remain UI-focused (loading, disabled states, auto-scroll).

### Shared Package (`@chatbot/shared`)

Used by both frontend and backend for:
- shared DTO shapes (`Message`, `ChatRequest`, `ChatResponse`)
- shared constraints (`CHAT_MESSAGE_MAX_LENGTH`)

## Setup (Local)

### Prerequisites

- Node.js
- pnpm
- Docker (for PostgreSQL)

### Quick Start

```bash
pnpm install
docker compose up -d
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Development Environment

### Local URLs
| Service | URL |
| :--- | :--- |
| **Frontend** (Vite) | `http://localhost:5173` |
| **Backend** (NestJS) | `http://localhost:3000` |
| **Database** (Postgres) | `localhost:5432` |

### Configuration (`.env`)

**Backend** (`apps/backend/.env`):
- `DATABASE_URL`: PostgreSQL connection string.
- `PORT`: Server listening port (default: `3000`).

**Frontend** (`apps/frontend/.env`):
- `VITE_API_URL`: NestJS API URL (default: `http://localhost:3000`).

### Useful Commands

```bash
pnpm dev              # run backend + frontend (workspace parallel)
pnpm build            # build all packages
pnpm test             # run backend tests (Current test coverage focuses on backend business logic and validation)

pnpm db:migrate       # prisma migrate dev + prisma generate (backend)
pnpm db:seed          # prisma db seed (rules)
pnpm db:reset         # prisma migrate reset --force
```

## API

Base URL (dev): `http://localhost:3000`

### POST /chat

Request:
```json
{ "message": "string" }
```

Response:
```json
{ "response": "string" }
```

Behavior:
- Validates and trims `message`
- Saves the user message in PostgreSQL
- Loads chatbot rules from PostgreSQL and matches keywords (case-insensitive)
- Produces a response (fallback: `I don't understand your request`)
- Saves the bot response in PostgreSQL
- Returns the response

### GET /chat/history

Response:
```json
[
  { "id": 1, "role": "USER", "content": "hello", "createdAt": "2026-01-01T10:00:00.000Z" },
  { "id": 2, "role": "BOT", "content": "Hello! How can I assist you today?", "createdAt": "2026-01-01T10:00:01.000Z" }
]
```

Behavior:
- Returns persisted messages ordered by `createdAt` ascending
- Uses `Cache-Control: no-store` (history should never be stale in the UI)

## Validation & Error Handling

**Backend**
- Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`
- `CreateChatDto` trims the message and enforces:
  - non-empty string
  - max length: `CHAT_MESSAGE_MAX_LENGTH`

**Frontend**
- Disables input while history is loading and while sending
- Enforces max length at the input level (`maxLength`)
- Trims before sending

**Network robustness**
- Request timeout (AbortController-based) for history and send
- Friendly network/offline error messages surfaced in the UI
- React Query retry strategy:
  - queries retry up to 2 times
  - mutations do not retry (prevents duplicate messages)

## Testing

Backend tests (Jest):
- Keyword matcher unit tests (multi-intent ordering + greeting priority)
- Controller-level validation tests for `/chat` (missing/empty/whitespace, max length, extra fields)

Run:
```bash
pnpm --filter @chatbot/backend test
```

## Technical Decisions (Pragmatic)

- **NestJS**: fast to structure well (modules/controllers/services), strong validation story.
- **React Query**: removes manual `useEffect` server-state handling; provides caching, retries, and clean loading states.
- **Prisma + PostgreSQL**: type-safe DB access and a simple local setup via Docker.
- **Monorepo + shared package**: keeps contracts consistent and avoids drift between frontend and backend.

## Author
Ahmed Baklouti
