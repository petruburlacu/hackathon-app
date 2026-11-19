# ⚖️ Trial by Code — Hackathon Platform

Web app for running an internal hackathon: participants sign up, submit and vote on ideas, form teams, and follow a live leaderboard. Admins control when idea and team submissions are open.

**Stack:** [Next.js 16](https://nextjs.org/) (App Router) · [Convex](https://www.convex.dev/) (database + backend functions) · [Convex Auth v2](https://docs.convex.dev/auth/convex-auth) (username/password) · [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) · hosted on [Vercel](https://vercel.com/).

Want to contribute? See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Quick start

Prerequisites: **Node.js 24.15+** (`nvm install` reads [`.nvmrc`](./.nvmrc)) and npm.

```sh
git clone git@github.com:petruburlacu/hackathon-app.git
cd hackathon-app
npm ci
npm run dev
```

The first `npm run dev` runs `npx convex dev`, which asks where to run the backend:

- **Start without an account (run Convex locally)**: the quickest option. Convex runs a local backend on your machine, and its data lives in `.convex/local/` (gitignored).
- **Log in / create a project**: a free personal cloud dev deployment, useful if you want to share a URL.

The CLI writes `.env.local` (`CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`) and pushes the functions in `convex/`. Then `npm run dev` starts Next.js on <http://localhost:3000> and the Convex watcher together, and opens the Convex dashboard.

You don't need any auth keys or other env vars for local development.

### Create your first users

1. Go to <http://localhost:3000/signin> and choose **Join the hackathon**.
2. Sign up with the username `admin@hackathon.com` to get the admin role. Any other username is a regular participant.
3. Passwords need at least 10 characters and can't be a common password.
4. As admin, the **Admin** page can seed sample ideas and toggle submissions.

> The admin account is identified only by its username (see `ADMIN_USERNAME` in [`convex/users.ts`](./convex/users.ts)). On a fresh deployment, **register the admin account before sharing the URL**, because whoever claims that username first becomes admin.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Convex dev watcher + `next dev` |
| `npm run build` | Production Next.js build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | `tsc` for the Next.js app **and** the `convex/` project |

Run `lint` and `typecheck` before opening a PR.

## Project layout

```
app/                 Next.js routes
  (splash)/          public landing page
  signin/            sign-in / sign-up page
  hackathon/         the app (protected): ideas, teams, leaderboard, admin, profile…
  auth/              Convex Auth SSR route handlers (sign-in, refresh, sign-out)
components/          shared React components (ui/ = shadcn primitives)
convex/              backend: schema.ts, functions (hackathon.ts, users.ts, …), auth wiring
  convex.config.ts   mounts the Convex Auth components
lib/                 convexAuth.ts / serverAuth.ts (Next.js auth helpers), utils
proxy.ts             Next.js proxy: redirects signed-out users away from /hackathon
```

How auth works: Convex Auth v2 keeps auth data in Convex **components**, not in your own tables. The username lives in the `authUsername` component, so use `getUsername()`/`isAdmin()` from `convex/users.ts` and don't read fields off the `users` table. The browser only holds a short-lived access token. The refresh token lives in an httpOnly cookie set by the `app/auth/*` routes.

## Configuration

| Where | Variable | Purpose |
|---|---|---|
| Convex deployment env (optional) | `ENABLE_IDEA_SUBMISSIONS`, `ENABLE_TEAM_SUBMISSIONS` | Default for submissions when the admin hasn't set them in the app (`"false"` closes them). Admin settings in the database win. |
| Vercel | `CONVEX_DEPLOY_KEY` | Lets the Vercel build deploy Convex functions (see below). |

`NEXT_PUBLIC_CONVEX_URL` is set for you: by `convex dev` locally, and by `convex deploy` on Vercel.

## Deployment (Vercel + Convex)

Production is a Vercel project linked to this repo plus a Convex **production** deployment.

1. In the [Convex dashboard](https://dashboard.convex.dev), open the project → **Production** → *Settings* → **Generate Production Deploy Key**.
2. In Vercel → *Project Settings* → *Environment Variables*, add `CONVEX_DEPLOY_KEY` with that key, scoped to **Production** only.
3. In Vercel → *Build & Development Settings*, set the **Build Command** to:
   ```sh
   npx convex deploy --cmd 'npm run build'
   ```
   This pushes `convex/` to production and then builds Next.js with `NEXT_PUBLIC_CONVEX_URL` pointing at it.
4. Optional, for PR previews: generate a **Preview Deploy Key** in Convex and add it as `CONVEX_DEPLOY_KEY` scoped to **Preview**. Each PR then gets its own throwaway backend.

Don't put the production key in the Preview scope. If you do, every PR build deploys its functions to production.

## Starting a new hackathon with a clean database

Easiest and safest way: create a **new Convex project** and point Vercel at it. The old project stays around as an archive until you delete it.

1. Create a new project in the [Convex dashboard](https://dashboard.convex.dev). Or run `npx convex dev --configure new` locally, which also switches your `.env.local` to it.
2. Generate a production deploy key for the new project and replace `CONVEX_DEPLOY_KEY` in Vercel (Production).
3. Redeploy on Vercel. The first build creates the schema and installs the auth components.
4. Register `admin@hackathon.com` right away (see above), then seed or configure from the Admin page.
5. When you no longer need the old Convex project, delete it from its dashboard *Settings*.

Update the event details too: the event name and start date live in [`lib/event.ts`](./lib/event.ts).

## Docker (optional)

There's a standalone-output [`Dockerfile`](./Dockerfile) (Node 24) if you need to run it outside Vercel:

```sh
docker build --build-arg NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud -t hackathon-app .
docker run -p 3000:3000 hackathon-app
```
