# ChaosDrive web

The Next.js App Router frontend for ChaosDrive.

- Full product/architecture/run docs: [`../../README.md`](../../README.md)
- Local full stack: `docker compose up --build` from the repo root
- Host-only frontend: `npm run dev:web` from the repo root (expects the API at `http://localhost:8080`)
- Validate: `npm run lint --workspace @chaosdrive/web` and `npm run build --workspace @chaosdrive/web`

The visual system is intentionally static: paper textures, tape, clips, stamps, marker and typewriter type. There are no animations, transitions, or scroll effects.
