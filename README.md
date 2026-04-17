# CoHomed Admin Dashboard

The administrative control panel for CoHomed. Built with Next.js 15, TypeScript, Tailwind, and Supabase.

## What's in here

A complete admin dashboard for managing the CoHomed platform:

- **Dashboard** — key metrics (users, groups, documents, payments) and recent activity
- **Users** — list, filter, view details, change roles, set demo progress, delete
- **Groups** — list, filter, view all members/docs/expenses/payments, manage status
- **Documents** — list all documents across all groups, view content and signatures
- **Expenses** — filterable list of all expenses
- **Payments** — filterable list of all payments
- **Regions** — toggle regions live/disabled, edit currency, legal terms, factoids
- **Government Schemes** — full CRUD for schemes like FHOG, Boost to Buy
- **Pricing Tiers** — edit setup fees and transaction rates per region
- **Vouchers** — three tabs:
  - **Rules** — reusable templates defining discount, code shape (length, charset, prefix), uses per code, expiry, and targeting
  - **Generate** — bulk-create up to 10,000 codes from a rule with optional campaign name and expiry override
  - **Codes** — browse all codes, bulk activate/deactivate/delete/export, edit individual codes with custom overrides
- **Document Templates** — configure which documents exist per region
- **Notifications** — send in-app notifications to users (all / region / individual)
- **Announcements** — create dismissible banner messages shown in the app
- **Site Settings** — feature flags, support email, platform config
- **Activity Log** — browse audit trail of all admin and user actions

All data flows through the same Supabase database as the mobile app, so changes sync instantly.

## Prerequisites

- Node.js 20+
- The CoHomed Supabase database (migrations 001-013 applied)
- At least one user with `app_role = 'global_admin'` in the `profiles` table

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

Visit `http://localhost:3000` and log in with your admin account.

## Required database migrations

Before deploying, run these in your Supabase SQL Editor, in order:

### `supabase-migration-013.sql`

Creates:
- `site_settings` table (feature flags, support email, etc.)
- `announcements` table (banner messages)
- `announcement_dismissals` table (tracks which users dismissed which banners)
- `pricing_defaults` JSONB column on `region_config`

### `supabase-migration-014.sql`

Creates the voucher rules + bulk generation system:
- `voucher_rules` table (templates for generating codes)
- Adds `rule_id`, `generated_in_batch`, `applies_to`, `region_code`, group size constraints, `internal_notes`, `campaign_name` columns to `vouchers`
- `generate_voucher_codes(rule_id, quantity, campaign_name, expires_at)` RPC function for collision-safe bulk generation

Both migrations are idempotent and safe to re-run.

## Deploying to Vercel

### Option A: Vercel UI (recommended)

1. Push this folder to a GitHub repository (public or private)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo — Vercel auto-detects Next.js
4. Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key (secret) |

   **Important**: `SUPABASE_SERVICE_ROLE_KEY` must NOT have the `NEXT_PUBLIC_` prefix — it's server-only and Vercel encrypts it at rest.

5. Click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
# Follow prompts, set env vars when asked
```

### Custom domain

Once deployed, go to **Settings → Domains** in the Vercel project and add `admin.cohomed.com.au`. Vercel will give you DNS records to add at your domain registrar (typically a CNAME pointing to `cname.vercel-dns.com`).

SSL is automatic — Vercel handles certificate issuance and renewal.

## Finding your Supabase keys

In the Supabase Dashboard:

1. Select your CoHomed project
2. Go to **Settings → API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys → service_role** → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" — keep this secret)

## Making yourself an admin

If you haven't already, run this SQL in the Supabase SQL Editor:

```sql
UPDATE profiles SET app_role = 'global_admin' WHERE email = 'your@email.com';
```

Three roles exist:

- `standard_user` — default for all users
- `regional_admin` — can manage users/groups in their region (UI ready, RLS scope is your decision)
- `global_admin` — can do everything

## Security notes

- The service role key bypasses Row Level Security. Only the server uses it. Next.js server components and API routes run on the server, so the key is never sent to the browser.
- `middleware.ts` refreshes the Supabase session on every request.
- Every admin page calls `requireAdmin()` which verifies the user has an admin role before rendering.
- The `/api/users/[id]` DELETE endpoint and dangerous mutations require `global_admin`.

## Project structure

```
admin-site/
├── app/
│   ├── api/                    # Server API routes (delete user, send notifications)
│   ├── dashboard/              # Protected admin pages
│   │   ├── users/              # User management
│   │   ├── groups/             # Group management
│   │   ├── documents/          # Document browser
│   │   ├── expenses/           # Expense browser
│   │   ├── payments/           # Payment browser
│   │   ├── regions/            # Region config
│   │   ├── schemes/            # Govt scheme CRUD
│   │   ├── pricing/            # Pricing tier editor
│   │   ├── vouchers/           # Voucher CRUD
│   │   ├── templates/          # Document template config
│   │   ├── notifications/      # Send notifications
│   │   ├── announcements/      # Banner CRUD
│   │   ├── settings/           # Site settings
│   │   └── activity/           # Audit log browser
│   ├── login/                  # Login page
│   └── unauthorized/           # Non-admin landing
├── components/
│   └── Sidebar.tsx             # Main nav
├── lib/
│   ├── supabase.ts             # Server-side clients + requireAdmin helper
│   └── supabase-client.ts      # Browser client
├── middleware.ts               # Session refresh
├── supabase-migration-013.sql  # Site settings, announcements, pricing defaults
└── supabase-migration-014.sql  # Voucher rules + bulk generation system
```

## Troubleshooting

**"Unauthorized" on every page**: You need to run the SQL above to set your `app_role = 'global_admin'`.

**Sidebar doesn't render pricing/announcements/vouchers changes**: These pages depend on migrations 013 and 014. If you haven't run them, those sections will show empty states or errors.

**Service role key error**: Double-check the env var name is exactly `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). If you set it with the prefix, it won't work — and you just made the key public. Rotate the key immediately in Supabase settings if that happens.

**Migration 013 or 014 fails**: If your Supabase instance is missing any of the referenced tables (profiles, region_config, vouchers), make sure migrations 001-012 from the mobile app project have been run first.
