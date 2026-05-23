# Carta Genesis — Monorepo

Sitio web personal + backend con analytics y registro de respuesta.

```
carta-genesis/
├── frontend/            ← React + Vite + Tailwind + Framer Motion
├── frontend-admin/      ← Admin Panel (React + TS + Tailwind)
├── backend/             ← Bun + Hono + Drizzle + Postgres
└── docker-compose.yml   ← orquesta los 4 servicios
```

## Stack

- **Frontend:** Vite, React 19, Framer Motion, Tailwind CSS 3, nginx Alpine
- **Admin:** Vite, React 19, React Router, TanStack Query, Tailwind, nginx Alpine
- **Backend:** Bun 1.x, Hono, Drizzle ORM, Zod, pino, TypeScript
- **DB:** Postgres 16 Alpine
- **Deploy:** Dokploy con `docker-compose.yml`

## Desarrollo local con Docker (recomendado)

1. Copia `.env.example` a `.env` y rellena las variables con valores fuertes:

   ```powershell
   $pgPass = -join ((48..57) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   $salt = -join ((48..57) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
   $token = -join ((48..57) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
   @"
   POSTGRES_PASSWORD=$pgPass
   IP_HASH_SALT=$salt
   ADMIN_TOKEN=$token
   FRONTEND_ORIGIN=http://localhost
   ADMIN_ORIGIN=http://localhost:8080
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=change-me-now
   "@ | Out-File -Encoding utf8 .env
   ```

2. Arranca todo:

   ```bash
   docker compose up -d --build
   ```

3. Abre `http://localhost/` (carta) y `http://localhost:8080/` (admin).

Guarda el `ADMIN_TOKEN` — lo necesitas para los endpoints `/api/admin/*`.

## Desarrollo local sin Docker

1. Arranca solo Postgres:

   ```bash
   docker run -d --name carta-db -e POSTGRES_PASSWORD=dev -e POSTGRES_USER=carta -e POSTGRES_DB=carta -p 5432:5432 postgres:16-alpine
   ```

2. Backend en modo watch:

   ```powershell
   cd backend
   $env:DATABASE_URL="postgres://carta:dev@localhost:5432/carta"
   $env:IP_HASH_SALT=("a" * 40)
   $env:ADMIN_TOKEN=("b" * 40)
   bun run start  # corre migrations + arranca server
   ```

3. Frontend en modo Vite (otra terminal):

   ```bash
   cd frontend
   npm run dev
   ```

   Vite levanta en `localhost:5173`. Para que `/api/*` apunte al backend, agrega un proxy a `vite.config.js` (no incluido por defecto — el reverse proxy real es nginx en producción).

## Tests

```bash
cd backend
bun test:unit                  # rápido, sin DB

# Integration tests requieren un Postgres dedicado en 5434:
bun run test:db:start          # arranca container test
bun run test:integration       # corre los tests
bun run test:db:stop           # tear down

bun test                       # corre TODO (unit + integration)
```

## Endpoints backend

| Método | Path | Auth | Rate limit | Descripción |
|---|---|---|---|---|
| GET | `/api/health` | — | — | Status + DB connectivity |
| POST | `/api/visit` | — | 10/min/IP | Registra visita |
| POST | `/api/respuesta` | — | 5/min/IP | Registra respuesta (idempotente por `visitorUuid`) |
| GET | `/api/admin/stats` | Bearer | — | Stats agregadas |
| GET | `/api/admin/visits?limit=N&offset=M` | Bearer | — | Listado paginado |
| POST | `/api/auth/login` | Session | — | Login admin (cookie) |
| GET | `/api/auth/me` | Session | — | User actual |
| POST | `/api/admin/cualidades` | Session | — | CRUD admin |

Llamadas admin requieren `Authorization: Bearer <ADMIN_TOKEN>`.

### Ejemplo de consulta admin

```powershell
$token = (Get-Content .env | sls 'ADMIN_TOKEN=').Line.Split('=')[1]
Invoke-RestMethod http://localhost/api/admin/stats -Headers @{ Authorization = "Bearer $token" }
```

## Despliegue en Dokploy

1. Push del repo a Git.
2. En Dokploy: **New Application → Docker Compose** → apunta al repo.
3. En la UI de Dokploy, define las variables: `POSTGRES_PASSWORD`, `IP_HASH_SALT`, `ADMIN_TOKEN`, `FRONTEND_ORIGIN`, `ADMIN_ORIGIN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
4. Asigna dominio al servicio `frontend` y `frontend-admin`. Dokploy maneja TLS via Let's Encrypt.
5. Deploy.

## Roadmap

- ✅ **Fase 1** — Backend base + visitas + respuesta (este)
- ⏳ **Fase 2** — Panel admin web + uploads de fotos/música/cualidades
- ⏳ **Fase 3** — Chat en tiempo real con Genesis
