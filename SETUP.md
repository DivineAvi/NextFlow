# NextFlow — Setup Guide

## Prerequisites

- Node.js 20+, pnpm 9+
- A free [Neon](https://neon.tech) PostgreSQL database
- A free [Clerk](https://clerk.com) account (auth)
- A free [Google AI Studio](https://aistudio.google.com) key (Gemini)
- A free [Trigger.dev](https://cloud.trigger.dev) account (task execution)
- A [Transloadit](https://transloadit.com) account (file uploads)

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure environment

```bash
cp .env.example apps/web/.env.local
# Fill in all values in apps/web/.env.local
```

## 3. Generate Prisma client & push schema

```bash
cd packages/core
pnpm db:generate   # generates the Prisma client
pnpm db:push       # pushes schema to Neon (no migration files)
```

## 4. Configure Transloadit templates

In your [Transloadit dashboard](https://transloadit.com/c/templates/):
1. Create an **image** template (e.g. `/google/store` robot pointing at your GCS bucket) and copy its ID
2. Create a **video** template similarly and copy its ID
3. Add to `apps/web/.env.local`:

```env
TRANSLOADIT_KEY=<your auth key>
TRANSLOADIT_SECRET=<your auth secret>
```

4. Set the template IDs in `apps/web/app/api/transloadit/route.ts`:

```ts
const TEMPLATE_IDS = {
  image: "<your image template id>",
  video: "<your video template id>",
};
```

## 5. Run the Next.js dev server

```bash
pnpm --filter web dev
```

## 6. Run Trigger.dev dev worker (in a second terminal)

```bash
cd apps/web
npx trigger.dev@latest dev
```

This connects your local Trigger.dev tasks to the cloud dashboard and lets them execute.

## 7. Webhook setup (optional for user sync)

In your [Clerk dashboard](https://dashboard.clerk.com):
1. Go to **Webhooks → Add Endpoint**
2. URL: `https://<your-tunnel>/api/webhooks/clerk`
3. Subscribe to `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SIGNING_SECRET`

Use [ngrok](https://ngrok.com) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to expose localhost.

## 8. Deploy to Vercel

### Import project

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. In **Configure Project**, set:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js
   - **Node.js Version**: 20.x

### Build & install overrides

In **Vercel → Settings → General → Build & Development Settings**:

| Setting | Value |
|---|---|
| Install Command | `cd ../.. && pnpm install` |
| Build Command | `pnpm build` |
| Output Directory | `.next` (default) |

### Environment variables

In **Vercel → Settings → Environment Variables**, add every key from `.env.example`:

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SIGNING_SECRET
GEMINI_API_KEY
TRIGGER_SECRET_KEY
TRANSLOADIT_KEY
TRANSLOADIT_SECRET
```

Set all to **Production**, **Preview**, and **Development** environments.

### Post-deploy checklist

- [ ] Update Clerk webhook URL → `https://<your-app>.vercel.app/api/webhooks/clerk`
- [ ] Deploy Trigger.dev tasks to production:
  ```bash
  cd apps/web
  TRIGGER_SECRET_KEY=<prod-key> npx trigger.dev@latest deploy
  ```
- [ ] Run `pnpm db:push` from `packages/core` against the production `DATABASE_URL` to ensure schema is up to date
- [ ] Visit `https://<your-app>.vercel.app` — should redirect to sign-in

---

## Architecture Overview

```
apps/web/
├── middleware.ts          # Clerk auth guard (all routes except public ones)
├── app/api/           # Next.js API routes
│   ├── execute-workflow/  # Triggers workflow run via Trigger.dev
│   ├── runs/          # Fetch run history (polled by history sidebar)
│   ├── transloadit/   # Returns signed Transloadit assembly params
│   ├── workflows/     # CRUD for saved workflows
│   └── webhooks/clerk # Clerk user sync
├── trigger/           # Trigger.dev tasks (run on Trigger.dev cloud)
│   ├── orchestrator.ts    # DAG execution engine
│   ├── llm.ts             # Gemini API calls
│   └── media.ts           # FFmpeg crop & frame extraction
├── store/canvas-store.ts  # Zustand state (nodes, edges, undo/redo)
├── ui/workflow-builder/
│   ├── canvas/            # ReactFlow canvas + connection handler
│   ├── nodes/             # All 6 node implementations + renderers
│   └── sidebar/           # Left (node library) + Right (history)
└── config/
    ├── sidebar-nodes.ts   # Node library configuration
    └── sample-workflow.ts # Pre-built demo workflow
packages/core/
├── src/nodes/         # Node definitions (Zod-validated)
├── src/schema/        # Port & control schemas
├── src/helpers/       # hasCycle(), ValidateConnection()
├── src/db.ts          # Prisma client singleton
└── prisma/schema.prisma
```

## Adding a New Node Type

1. Create `packages/core/src/nodes/my-node.ts` with a `NodeDefinitionSchema.parse(...)` export
2. Register it in `packages/core/src/nodes/index.ts` NodeRegistry
3. Create `apps/web/ui/workflow-builder/nodes/implementations/my-node.tsx` using `<BaseNode>`
4. Export from `apps/web/ui/workflow-builder/nodes/index.ts`
5. Add to `NODE_TYPES` in `apps/web/ui/workflow-builder/type.ts`
6. Add to `SIDEBAR_NODES` in `apps/web/config/sidebar-nodes.ts`
7. Handle in `apps/web/trigger/orchestrator.ts` switch statement
