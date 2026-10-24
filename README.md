# ChaosDrive

A paper-office / chaotic-scrapbook take on a personal cloud drive. Nested folders, drag-and-drop uploads, name search, and a Trash drawer that lets you change your mind — wrapped in paper, tape, clips, coffee rings, marker ink, and typewriter labels.

ChaosDrive is a local-first monorepo:

- **Web** — Next.js 16 App Router, React 19, Tailwind CSS v4, TanStack Query
- **API** — .NET 10 minimal APIs, ASP.NET Core Identity, EF Core 10 + Npgsql
- **Database** — PostgreSQL 18
- **Files** — private AWS S3 bucket with presigned browser uploads/downloads
- **Runtime** — Docker Compose full stack, including a one-shot EF migration job

The interface is deliberately static. There are **no animations, transitions, scroll effects, or parallax** — just paper, ink, and instant state changes.

---

## Quick start

### Prerequisites

- Docker Desktop (with Compose v2)
- AWS credentials in `~/.aws` that can read/write the configured S3 bucket
- Node.js 24+ and .NET 10 SDK only if you want to run pieces on the host

### Run the full stack

```bash
cp .env.example .env
docker compose up --build
```

Open **http://localhost:3000**.

The `migrate` service applies EF Core migrations once before the API starts. PostgreSQL data, NuGet packages, API build output, and Data Protection keys are kept in named volumes.

Demo account:

```text
demo@chaosdrive.app
ChaosDrive123!
```

The demo is seeded automatically in Development and includes a few folders to poke around in.

Useful commands:

```bash
docker compose logs -f                 # follow all logs
docker compose logs -f api web         # follow app logs
docker compose ps                      # service status
docker compose --profile tools up -d   # Adminer at http://localhost:8081
docker compose down                    # stop; keeps data
docker compose down -v                 # stop and delete DB/keys/cache volumes
```

Adminer login: system `PostgreSQL`, server `db`, user/password/database from `.env`.

---

## What v1 does

- Email/password sign up and sign in
- httpOnly cookie sessions (ASP.NET Core Identity)
- Nested folders with create, rename, and move-to-Trash
- File uploads up to **100 MB** per file via presigned S3 PUT
- File rename, download (presigned GET), and move-to-Trash
- Trash view with restore and permanent delete
- Owner-scoped name search using PostgreSQL `ILIKE` + `pg_trgm`
- **5 GB** storage quota per user, with live usage meter
- Same-origin BFF proxy from Next.js to the API

Trash is a soft delete. Permanent delete removes database rows and the corresponding S3 objects.

---

## Architecture

```text
Browser
  │  httpOnly cookie, same-origin requests
  ▼
Next.js web (port 3000)
  │  /api/proxy/[...path] → forwards cookie + origin
  ▼
.NET API (port 8080)
  ├── ASP.NET Core Identity cookie auth
  ├── EF Core / Npgsql ──────────────► PostgreSQL 18
  └── presigned S3 PUT/GET ──────────► private S3 bucket
```

The browser never receives AWS credentials. The API signs short-lived S3 URLs:

- **Upload** — browser `PUT`s directly to S3 with the exact `Content-Type` that was signed, then calls `POST /api/files/{id}/complete`. The API `HEAD`s the object, validates size/quota, and marks it `ready`.
- **Download** — browser asks the API for a 5-minute presigned GET URL and is redirected by the browser to S3.

The Next.js BFF keeps the browser on one origin, so the auth cookie stays `HttpOnly` and `SameSite=Lax` without CORS or exposing the API directly.

### Repository layout

```text
.
├── apps/
│   ├── api/
│   │   ├── ChaosDrive.Api/            # .NET 10 minimal API
│   │   │   ├── Data/                  # DbContext, entities, migrations, seed
│   │   │   ├── Features/Auth/         # register/login/logout/me
│   │   │   ├── Features/Drive/        # drive, trash, search, folders, files
│   │   │   └── Storage/               # S3 presigning + metadata
│   │   ├── ChaosDrive.Api.Tests/      # xUnit tests
│   │   └── Dockerfile                 # dev / prod / migrate targets
│   └── web/
│       ├── src/app/                   # landing, auth, drive, BFF route
│       ├── src/components/            # paper kit, landing, auth, drive UI
│       ├── src/lib/                   # typed API client, uploads, formatting
│       └── Dockerfile                 # dev / prod targets
├── packages/api-client/               # shared TypeScript API types
├── compose.yaml                       # local full stack (hot reload)
├── compose.prod.yaml                  # production-style local stack
└── dotnet-tools.json                  # local dotnet-ef tool manifest
```

---

## Environment

Copy `.env.example` to `.env`. Compose reads `.env`; the API also reads the `__`-style overrides.

| Variable | Purpose | Local default |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | PostgreSQL credentials | `chaosdrive` / `chaosdrive` / `chaosdrive` |
| `APP_ORIGIN` | Allowed public web origin used by production Compose | `http://localhost:3000` |
| `COOKIE_SECURE` | Set `true` behind HTTPS in production | `false` |
| `ConnectionStrings__Default` | API database connection | `Host=db;...` in Compose |
| `App__Origin` | API origin allow-list for unsafe requests | `http://localhost:3000` |
| `Cookie__Secure` | Whether the auth cookie requires HTTPS | `false` |
| `AWS__Region` | S3 region | `ap-southeast-1` |
| `AWS__BucketName` | S3 bucket | `chaosdrive-files-544885083248-ap-southeast-1` |
| `DataProtection__KeysPath` | Persistent cookie-key directory | `/keys` in Compose |
| `API_URL` | Next.js server-side API base URL | `http://api:8080` in Compose |

For host-only frontend development, `API_URL` defaults to `http://localhost:8080`.

### AWS / S3 setup

The bucket is private and uses:

- Block Public Access (all four flags)
- SSE-S3 default encryption (`AES256`)
- A bucket policy denying non-TLS requests
- CORS allowing `PUT`, `GET`, `HEAD` from `http://localhost:3000` and `http://127.0.0.1:3000`, with `Content-Type` headers and `ETag` exposed

In Docker development the host `~/.aws` directory is mounted read-only into the API container. For real deployment, use an IAM role / task role with only the required S3 permissions rather than mounting credentials.

Minimal bucket permissions for the app role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET/users/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET",
      "Condition": { "StringLike": { "s3:prefix": ["users/*"] } }
    }
  ]
}
```

If you point the app at a different bucket, update `AWS__BucketName` / `AWS_BUCKET_NAME` and configure CORS for your public origin.

---

## Database and migrations

EF Core migrations live in `apps/api/ChaosDrive.Api/Data/Migrations`. The initial migration also enables `pg_trgm` and creates trigram indexes for name search.

The local Compose stack runs the migration bundle automatically. To apply migrations manually:

```bash
# host, using appsettings.json (localhost:5432)
dotnet tool restore
dotnet ef database update \
  --project apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj \
  --startup-project apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj

# inside Compose
docker compose run --rm migrate
```

Add a migration:

```bash
dotnet tool restore
dotnet ef migrations add MyMigration \
  --project apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj \
  --startup-project apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj \
  --output-dir Data/Migrations
```

### Production migration job

The API Dockerfile has a `migrate` target that builds a self-contained EF migration bundle. The bundle architecture follows BuildKit's `TARGETARCH`, so an `amd64` production build produces a `linux-x64` bundle and an Apple Silicon local build produces `linux-arm64`.

```bash
# build for a typical linux/amd64 deployment
docker buildx build --platform linux/amd64 \
  -f apps/api/Dockerfile --target migrate \
  -t chaosdrive-migrate .

# apply as a pre-deploy job
docker run --rm chaosdrive-migrate \
  --connection "$CONNECTION_STRING"
```

The same job is wired into `compose.prod.yaml` as the one-shot `migrate` service.

---

## Host development (without the full web/API containers)

Start only PostgreSQL:

```bash
docker compose up -d db
```

API (uses `appsettings.json` → localhost:5432, seeds the demo in Development):

```bash
dotnet tool restore
dotnet ef database update \
  --project apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj \
  --startup-project apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj
dotnet run --project apps/api/ChaosDrive.Api/ChaosDrive.Api.csproj
```

Web (defaults `API_URL` to `http://localhost:8080`):

```bash
npm install
npm run dev:web
```

The API listens on **8080**; Next.js on **3000**.

---

## Tests and checks

```bash
dotnet test apps/api/ChaosDrive.slnx          # 35 API tests
npm run lint --workspace @chaosdrive/web
npm run build --workspace @chaosdrive/web
dotnet build apps/api/ChaosDrive.slnx
```

Manual smoke checklist:

1. Sign in with the demo account.
2. Create a folder, open it, create a nested folder.
3. Upload a file (drag/drop or picker); watch the upload tray; confirm it appears.
4. Download it and verify the contents.
5. Rename it; search by name.
6. Move it to Trash, open Trash, restore it.
7. Move it to Trash again and delete it forever; confirm it is gone from the list and from S3.

---

## API surface

All product routes are under `/api` and require the auth cookie unless noted.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create account + sign in |
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/logout` | Sign out |
| `GET` | `/auth/me` | Current user + storage usage |
| `GET` | `/drive?folderId=` | Folder contents + breadcrumbs + storage |
| `GET` | `/drive/trash` | Trash roots |
| `GET` | `/drive/search?q=` | Name search |
| `POST` | `/folders` | Create folder |
| `PATCH` | `/folders/{id}` | Rename folder |
| `DELETE` | `/folders/{id}` | Move folder subtree to Trash |
| `POST` | `/folders/{id}/restore` | Restore subtree |
| `DELETE` | `/folders/{id}/permanent` | Permanently delete subtree |
| `POST` | `/files/uploads` | Create pending file + presigned PUT |
| `POST` | `/files/{id}/complete` | Verify S3 object and mark ready |
| `GET` | `/files/{id}/download` | Presigned GET URL |
| `PATCH` | `/files/{id}` | Rename file |
| `DELETE` | `/files/{id}` | Move file to Trash |
| `POST` | `/files/{id}/restore` | Restore file |
| `DELETE` | `/files/{id}/permanent` | Permanently delete file |

Development-only docs are available at `/openapi/v1.json` and `/scalar/v1`. `/health` checks database connectivity.

---

## Production notes

`compose.prod.yaml` builds production images and runs the migration job before the API:

```bash
docker compose -f compose.prod.yaml up --build -d
```

Before exposing it publicly:

- Set `APP_ORIGIN` to the real HTTPS origin and `COOKIE_SECURE=true`.
- Use a managed PostgreSQL instance or a strong `POSTGRES_PASSWORD`; do not publish port 5432.
- Use an IAM role for S3 instead of mounting `~/.aws`.
- Put the web container behind TLS (reverse proxy / load balancer).
- Keep the migration job in the deploy pipeline and run it against the production connection string.
- Protect the Data Protection key ring. Compose persists it to a named volume, but the keys are unencrypted by default; use certificate-encrypted keys or a managed key store for a real deployment.
- Scale the web/API independently; the in-memory auth rate limiter is per API instance.
- The landing page advertises the Development demo account. Remove or gate that card before a public production launch, because the demo is only seeded in Development.
- `npm audit --omit=dev` reports 0 vulnerabilities. The full audit reports dev-only advisories in the ESLint toolchain; those packages are not included in the production web image.
- Consider lifecycle rules for abandoned pending uploads and for trash objects if you want automatic cleanup.

Known v1 limitations:

- Search returns up to 10 folders + 10 files; no pagination yet.
- Trash is never auto-purged; trashed objects still consume S3 storage.
- Sibling-name uniqueness is enforced in application code, not by a database constraint.
- Quota checks are not serialized, so concurrent uploads/restores can slightly exceed the quota.
- Auth rate limiting is keyed by the API-observed remote address. In Docker the BFF is the caller, so all users share the 20/min auth bucket. Forward client IPs through a trusted reverse proxy if you need per-user limits.
- The API trusts the BFF's `Origin` header but does not use a separate CSRF token; the cookie is `SameSite=Lax` and the BFF is same-origin.
