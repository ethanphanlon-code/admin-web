import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// ─────────────────────────────────────────────────────────────
// Standard client (uses user's auth session via cookies)
// Use this for everything that should respect RLS policies.
// ─────────────────────────────────────────────────────────────
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component — can be ignored if middleware handles session refresh
          }
        },
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────
// Service role client (bypasses RLS — admin only!)
// Use this ONLY for admin operations that must override RLS,
// e.g., viewing all users, updating region config, etc.
// This should NEVER be exposed to the client.
// ─────────────────────────────────────────────────────────────
export function createSupabaseAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}

// ─────────────────────────────────────────────────────────────
// Require admin — checks role and returns current user
// Call this at the top of every admin-only Server Component/Action
// ─────────────────────────────────────────────────────────────
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false as const, reason: 'not_authenticated' as const };
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, email, full_name, app_role')
    .eq('id', user.id)
    .single();

  if (!profile || !['global_admin', 'regional_admin'].includes(profile.app_role)) {
    return { authorized: false as const, reason: 'not_admin' as const, profile };
  }

  return { authorized: true as const, user, profile, supabase, admin };
}
