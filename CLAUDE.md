Act like a senior software developer. Always follow best practices when coding. Respect and use the conventions, libraries, etc., that are already present in this codebase. Be diligent—no laziness! You must NEVER leave comments describing code without actually implementing it! You must ALWAYS FULLY IMPLEMENT the required code!

---

# Claude Code bootstrap for **Next.js + NestJS + Tailwind + shadcn UI + Prisma + Zod + Supabase**

Always initiate the frontend with `pnpm dlx shadcn@latest init` and ask for next components to add.

This file is injected into every Claude Code prompt opened at repo‑root. Keep it concise (< 200 lines). Update it in the same PR as any script, folder, or guideline change.

## Repo layout (monorepo, `pnpm` workspaces)

```
/                   -- root, shared config
  packages/
    web/            -- Next.js 15 App Router
      components/   -- shadcn components
    api/            -- NestJS 10 (Fastify)
      src/          -- NestJS source code
        common/     -- common helpers
        modules/    -- NestJS modules
        shared/     -- shared services
      prisma/       -- schema & migrations
  .github/          -- CI, CD, PR templates
```

- **Monorepo tooling**: managed with `pnpm workspaces` + **Turborepo** remote cache; run `turbo run test --filter=<scope>` in CI for affected‑package speed.

## Essential commands

| Task         | Command               | Notes                                |
| ------------ | --------------------- | ------------------------------------ |
| Dev (all)    | `pnpm dev`            | Turbo runs Next (3000) + Nest (4000) |
| Lint         | `pnpm lint`           | **Run before every commit**          |
| Typecheck    | `pnpm typecheck`      | `--noEmit`                           |
| Build (prod) | `pnpm build`          | Web & API bundles                    |
| Test         | `pnpm test`           | Vitest + Supertest                   |
| DB migrate   | `pnpm prisma:migrate` | wraps `prisma migrate dev`           |
| Seed DB      | `pnpm db:seed`        | calls `ts-node prisma/seed.ts`       |

🚦 **Claude MUST run **\`\`** before marking any task \*\*\***done**\***.\*\*

## Code‑style (Clean Code snapshot)

- **No semicolons** – `@typescript-eslint/semi: "never"`.
- Strict TS (`strict`, `noImplicitReturns`, `exactOptionalPropertyTypes`).
- Prefer **pure functions**, SRP: one module ⇢ one responsibility.
- Functions ≤ 50 lines; files > 200 lines ➞ split by domain.
- Keep cyclomatic complexity < 10.
- **DRY** – extract helpers, reuse Prisma services.
- JsDoc **every** public fn / class; omit obvious comments.
- Self‑documenting names (`getActiveUser`, not `getData`).
- Use Object.freeze enums, never magic numbers.
- **Type‑safety first** – **never** use `as` type assertions (e.g., `value as string`). Rely on proper generics and **Zod** parsing (`schema.parse(...)`) for runtime validation and narrowing.
- Order: imports → types → const → functions → export.
- **NestJS** – **never** use `forwardRef()` in module imports. If a circular‑dependency error appears, refactor by extracting shared providers into a new feature‑less module or by providing an explicit injection token; do **not** resort to `forwardRef()`.
- **Bootstrap**: In `main.ts` enable `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))`, `app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))`, and `ConfigModule.forRoot({ isGlobal: true })` for consistent validation, serialization, and config across modules.
- Never use module.exports, always use ES6 exports.
- Never use require, always use import.

## Exception handling & error codes

### Authoring rules

1. `http-exception.filter.ts`, Global `@Catch()` that intercepts every thrown error. If it is a `CustomException` (or any `HttpException`) the filter forwards the body untouched. For unknown errors it logs the stack and returns a hard‑coded 500 JSON (`Internal server error`).
2. `@common/exceptions/custom.exceptions.ts` Declares \`\`, a thin wrapper over Nest's `HttpException`. It logs via `Logger.error(code: msg)` and builds a JSON payload `{ message, details?, errorCode?, timestamp }`. All project‑specific exceptions inherit from this.
3. `<domain>.exception.ts` (e.g., `bounties.exception.ts`) Contains a string enum‑like `errorCodes` map and a domain subclass (e.g., `BountiesException`). The constructor accepts a short code (`BHB001`) and optional `details`, looks up the human‑readable template, interpolates placeholders (`{id}`), then calls `super` with proper status.
4. **Throw in services**, never controllers: keeps transport clean and eases unit testing.
5. **Define codes**: three‑letter domain prefix + 3‑digit sequence. Reserve `000‑099` for validation, `100‑199` for authorization, `900‑999` for infrastructure.
6. **Message templates** use `{snakeCasePlaceholder}` that the domain exception replaces via `template.replaceAll`.
7. **Logging**: subclasses rely on `CustomException` to log `ERROR <code>: <resolvedMessage>` with details for Kibana.
8. **Do not leak secrets**: never interpolate raw DB errors; map them to user‑safe codes.
9. **Testing**: write contract tests asserting filter output exactly matches `{ message, errorCode }` for each domain service path.

### Usage example

```ts
// In service
if (!user) throw new AuthException('AUT102', HttpStatus.UNAUTHORIZED, { userId })

// In controller
@Post(':id/approve')
async approve(@Param('id', ZodId) id: string) {
  await this.approveBountyUseCase.execute({ id })
  return { ok: true }
}
// No try/catch needed – GlobalExceptionFilter handles it
```

## Validation

- Create `<entity>.zod.ts` beside DTO.
- Validate in controllers:

```ts
const dto = zodSchema.parse(req.body);
```

- Never trust client; re‑validate on API.

## UI / shadcn / Tailwind rules / shadcn / Tailwind rules

- Only use shadcn for atomic components, compose in `/packages/ui`.
- Style via Tailwind utility classes + `cn()` helper; avoid inline `style`.
- When adding a component, update `/packages/ui/README.md` with API and example.

### Frontend (Next.js) & SEO best practices

- **Routing:** colocate routes in `/app` directory; keep segments shallow (< 3).
- **Rendering strategy:**

  - Use SSG/ISR where possible (`export const revalidate = <sec>`).
  - Fallback to SSR for personalized pages with `fetch({ cache: 'no-store' })`.

- **SEO essentials:** per‑route `metadata` export (title, description, OG/Twitter) + structured JSON‑LD.
- **Performance:** `next/image`, `next/font`, dynamic import with `{ ssr: false }`; aim for Lighthouse ≥ 90.
- **CDN caching:** `/_next/static/*` → `public, immutable`; edge functions set `s-maxage` & `stale-while-revalidate`.
- **Sitemap & robots:** generated via `next-sitemap` in CI.
- **Data fetching:** prefer Server Components & Actions for CRUD close to UI; delegate CPU‑intensive jobs or multi‑source aggregation to NestJS APIs.
- **Module‑scoped components:** Follow the route‑as‑module pattern—place page‑specific pieces inside `app/<route>/_components` to keep global `/components` truly global ([reddit.com](https://www.reddit.com/r/nextjs/comments/1hlasf0/nextjs_15_best_practice_for_file_structure_non/?utm_source=chatgpt.com)).

## README standards

A \*\*robust \*\*\`\` is mandatory. It must enable an engineer with zero prior context to:

1. Understand the product's purpose and high‑level architecture.
2. Install prerequisites (Node version, pnpm, Docker, supabase‑cli).
3. Clone and boot the stack (`pnpm i`, `docker-compose up`, `pnpm dev`).
4. Configure environment variables (`cp .env.example .env`, explain each key).
5. Run tests (`pnpm test`) and lints (`pnpm lint`).
6. Execute migrations & seeding (`pnpm prisma:migrate && pnpm db:seed`).
7. Add UI components via shadcn.
8. Troubleshoot common issues (e.g., port collisions, Postgres auth errors).
9. Contribute code: branching model, PR checklist, code style.
10. Deploy: how CI builds images & migrations and which env vars change.

Keep README sections concise; link to `/docs/*` pages for deep dives. Update the file in the **same PR** whenever scripts, env vars, or commands change.

## Distributed systems & database performance

- **Stateless services**: stash session/state in Redis or Postgres → enables horizontal scaling.
- **Idempotent endpoints**: accept `X‑Idempotency‑Key`; retry safely from client or message queue.
- **Graceful degradation**: implement circuit‑breakers + bulkheads (e.g., `@nestjs/circuit-breaker`) around third‑party calls.
- **Async workloads**: queue heavy jobs to BullMQ; workers auto‑scale via CPU queue depth.
- **Caching strategy**: Redis for hot key/value; `swr` on Next.js side for client caching; always set TTL.
- **DB discipline**: use Prisma `@index()` on foreign keys, prefer cursor‑based pagination, and wrap multi‑operations in `prisma.$transaction`.
- **Connection limits**: Postgres pooled via `pgnest` sidecar (max 100 conns prod, 10 dev).

### Data‑store selection

- **SQL (Postgres)** → strong consistency, multi‑row transactions, relational queries.
- **NoSQL (Dynamo, S3, RedisJson)** → unbounded scale, schema‑flexible docs, KV lookups.
- Mirror read‑heavy views to Elastic or RedisSearch; never fork the write path.

### Caching correctness

- Use _cache‑aside_: fetch, cache, invalidate on writes.
- Never cache short‑lived auth or PII; set TTL ≤ session life.
- Serve public GETs with `ETag` & `Last‑Modified` headers for 304s.
- **Env schema**: define `env.ts` with Zod; parse `process.env` once at boot and fail fast if keys are missing.

### Prisma schema best practices

- **Normalize until pain, denormalize for speed** – favor normalized models for OLTP; introduce materialized views or aggregated tables (kept in sync via workers) for read‑heavy dashboards.
- **Naming** – snake*case table names, singular Prisma model names; index names `<table>*<field>\_idx`.
- **Relations** – declare both sides explicitly with `referentialActions`; decide `Cascade` vs `Restrict` consciously.
- **Enums & constants** – prefer Postgres enums (`@@map`) or validated string unions; never sprinkle magic strings.
- **Soft‑delete** – add `deletedAt DateTime?` and include it in compound uniques.
- **Audit & versioning** – always have `createdAt @default(now())`, `updatedAt @updatedAt`; critical entities log to `_history` tables.
- **Migration hygiene** – squash dev migrations pre‑merge; deploy via `prisma migrate deploy`.

## Required Claude workflows

1. **Explore · Plan · Code · Commit** – always plan (`think harder`) before code.
2. **TDD** – write failing tests first.
3. Use `/clear` between unrelated tasks.
4. If uncertain, **STOP and ask** (do _not_ refactor blindly).

## Advanced Claude workflows

- **Visual iteration** – for UI tasks, Claude may take screenshots (via Puppeteer MCP or manual paste) and iterate until the result matches the mock.
- **Checklists / scratchpads** – for large migrations or lint‑fix marathons, Claude should generate a Markdown checklist and tick items as it proceeds.
- **Headless automation** – CI jobs may invoke `claude -p "<prompt>" --output-format stream-json` for issue triage or subjective linting.
- **Multi‑Claude** – One Claude writes code, another reviews; or split tasks using git worktrees.
- **Custom slash commands** – store reusable prompt templates in `.claude/commands/*.md`; they become `/project:<name>`.

Git or GitHub actions are **not** auto‑allowed; request explicit permission before any commit, push, or PR creation.

## When stuck

> If you're unsure how to solve a problem, **pause and ask Marcelo** before large refactors.

PLEASE, AGAIN, I BEG YOU, IF YOU ARE GOING TO USE A LIBRARY, ADD, CHANGE, WHATEVER, MAKE SURE THAT THE IMPORTS THAT YOU ARE USING, REFLECTS THE CURRENT DOCUMENTATION, GO TO THE WEBSITE OF THE TOOL/LIBRARY AND READ THE DOCUMENTATION, IF CAN'T READ, LET ME KNOW THAT I CAN GET FOR YOU, NEVER USE DEPRECATED IMPORTS, FUNCTIONS, ETC. ALWAYS USE THE LATEST VERSION ON EVERY LIBRARY YOU CAN FIND ON https://www.npmjs.com/package/ ADD THE LIBRARY NAME AT THE END AND SCRAP THE PAGE TO GET THE LATEST VERSION.
