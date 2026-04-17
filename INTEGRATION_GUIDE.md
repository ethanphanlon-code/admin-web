# CoHomed Admin Dashboard - Integration Guide

This is a complete, integrated Next.js 15 admin dashboard for CoHomed, an Australian proptech startup for property co-ownership.

## What's Included

### Core Features
- **Authentication**: Supabase-based login with session management
- **Dashboard**: Central hub with navigation and user management
- **User & Group Management**: View and manage users, groups, and brokers
- **Financial Management**: Payments, expenses, refunds, and broker commissions

### Admin-Specific Features
- **Audit Trail (ADM-001)**: Complete audit logging of all critical actions with compliance archival
- **Error Monitoring (ADM-002)**: Sentry integration for error tracking and monitoring dashboard
- **Cron Jobs (ADM-003)**: Scheduled task management with manual triggers and logging
- **Monitoring & Alerts**: Real-time system health and error tracking
- **Data Exports (ADM-006)**: Request and manage data exports for compliance
- **User Deletion (ADM-007)**: GDPR right-to-be-forgotten request management
- **Database Performance (OPS-007)**: Query statistics and performance metrics

### Content Management
- **Document Templates**: Template management and versioning
- **Email Templates**: Customize and manage email communications
- **Announcements**: System announcements and notifications

### Configuration
- **Regions**: Geographic region management
- **Pricing Tiers**: Subscription and pricing management
- **Vouchers & Schemes**: Promotional codes and government scheme support
- **System Settings**: Core application configuration

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **Error Monitoring**: Sentry
- **Authentication**: Supabase Auth

## Getting Started

### 1. Prerequisites

- Node.js 18+ and npm
- A Supabase project (same as the mobile app)
- (Optional) Sentry account for error monitoring

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# (And optional Sentry credentials)
```

### 3. Database Setup

Create the required tables in your Supabase project:

```sql
-- Audit logs table (for ADM-001)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text NOT NULL CHECK (actor_role IN ('owner', 'co_owner', 'admin')),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Cron jobs table (for ADM-003)
CREATE TABLE IF NOT EXISTS public.cron_jobs (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  schedule text NOT NULL,
  handler text NOT NULL,
  last_run timestamptz,
  next_run timestamptz,
  last_status text DEFAULT 'pending',
  is_enabled boolean DEFAULT true,
  timeout_ms integer DEFAULT 300000,
  retry_count integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cron job logs table
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text REFERENCES public.cron_jobs(id),
  status text NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  duration_ms integer,
  error_message text,
  result jsonb,
  created_at timestamptz DEFAULT now()
);

-- Data exports table (for ADM-006)
CREATE TABLE IF NOT EXISTS public.data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  resources text[] NOT NULL,
  format text DEFAULT 'csv',
  status text DEFAULT 'pending',
  file_url text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz
);

-- Deletion requests table (for ADM-007)
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  rejected_at timestamptz,
  rejected_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  deleted_at timestamptz
);

-- Refunds table (for PAY-002)
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id),
  amount numeric(10, 2) NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  error_message text
);
```

### 4. Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and log in with your admin credentials.

### 5. Production Build

```bash
npm run build
npm start
```

## Project Structure

```
cohomed-admin/
├── app/
│   ├── dashboard/              # Admin dashboard pages
│   │   ├── audit-log/         # Audit trail
│   │   ├── monitoring/        # Error monitoring
│   │   ├── cron-jobs/         # Cron job management
│   │   ├── data-exports/      # Data export requests
│   │   ├── deletion-requests/ # GDPR deletion requests
│   │   ├── refunds/           # Refund management
│   │   ├── broker-commissions/ # Broker payouts
│   │   ├── brokers/           # Broker management
│   │   ├── email-templates/   # Email template management
│   │   ├── db-performance/    # Database performance stats
│   │   └── [other pages]/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── audit-logs/
│   │   │   ├── data-exports/
│   │   │   ├── db-performance/
│   │   │   ├── deletion-requests/
│   │   │   └── refunds/
│   │   ├── cron/
│   │   ├── monitoring/
│   │   └── [other routes]/
│   ├── login/
│   └── layout.tsx
├── components/
│   ├── Sidebar.tsx            # Navigation
│   ├── ErrorBoundary.tsx      # Error handling
│   └── [other components]/
├── lib/
│   ├── audit.ts               # Audit trail utilities
│   ├── cron.ts                # Cron job utilities
│   ├── supabase.ts            # Supabase client
│   └── [other utilities]/
├── sentry.client.config.ts    # Sentry browser config
├── sentry.server.config.ts    # Sentry server config
├── next.config.js             # Next.js config with Sentry
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Environment Variables

See `.env.example` for all required environment variables. Key ones:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role (server-side only)
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry error tracking
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`: Sentry setup

## Key Features

### Audit Trail (ADM-001)
- Automatic logging of CRUD operations, payments, signing, and voting
- Filterable by user, group, action, resource type, and date range
- Archival for compliance (7-10 year retention for Australian regulations)
- RLS policies for secure access

### Error Monitoring (ADM-002)
- Sentry integration for real-time error tracking
- Error boundary component for React errors
- Admin dashboard showing error trends and statistics
- Session replay for debugging

### Cron Jobs (ADM-003)
- Pre-configured jobs: audit log archival, session cleanup, payment retries, invoice generation, notifications, statistics
- Manual job triggering from admin dashboard
- Job execution logs with timing and error details
- Enable/disable jobs without removing them

### Data Exports (ADM-006)
- Request exports of users, groups, documents, payments, and expenses
- CSV format with encryption
- Compliance-focused with access logging
- Automatic expiration after 30 days

### User Deletion (ADM-007)
- GDPR right-to-be-forgotten request management
- Approval/rejection workflow
- 30-day deletion window per regulations
- Audit trail of all deletion actions

## Admin User Setup

To create an admin user:

1. Sign up a user in Supabase
2. Update their profile in the `profiles` table to set `app_role = 'admin'`
3. Log in to the dashboard

## API Routes

### Admin Routes (require admin role)
- `GET/POST /api/admin/audit-logs` - Query audit logs
- `GET/POST /api/admin/data-exports` - Manage data exports
- `GET /api/admin/db-performance` - Database stats
- `POST /api/admin/deletion-requests/[id]/approve` - Approve deletion
- `POST /api/admin/deletion-requests/[id]/reject` - Reject deletion
- `POST /api/admin/refunds/[id]/approve` - Approve refund

### Cron Routes
- `POST /api/cron/[jobId]/run` - Manually trigger a job

### Monitoring Routes
- `GET /api/monitoring/errors` - Get error stats

## Security Considerations

1. **Row Level Security (RLS)**: All tables use RLS to enforce access control
2. **Admin Verification**: All admin routes verify admin role
3. **Audit Logging**: All critical actions are logged
4. **Service Role Key**: Never expose in browser code
5. **Environment Variables**: Sensitive keys are server-only
6. **CORS & Headers**: Security headers configured in next.config.js

## Deployment

### Vercel

```bash
# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms

```bash
# Build
npm run build

# Start
npm start
```

Ensure all environment variables are set correctly in your deployment environment.

## Performance Optimization

- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Caching strategies via Supabase and Next.js
- Database query optimization with proper indexing
- Source map uploads to Sentry for better debugging

## Troubleshooting

### "Unauthorized" when accessing admin pages
- Verify your user has `app_role = 'admin'` in the profiles table
- Check that SUPABASE_SERVICE_ROLE_KEY is set for server routes

### Sentry not capturing errors
- Set `NEXT_PUBLIC_SENTRY_DSN` and other Sentry variables
- Check that Sentry project is active
- Verify source maps are uploaded (automatic in Vercel)

### Database connection errors
- Verify Supabase URL and keys are correct
- Check that tables exist and RLS is properly configured
- Ensure service role key has appropriate permissions

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Sentry Documentation](https://docs.sentry.io/)
- [CoHomed Engineering Guidelines](./README.md)

## Support

For issues or questions about this admin dashboard, contact the CoHomed engineering team.

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-16  
**Status**: Production Ready
