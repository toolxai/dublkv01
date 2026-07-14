import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Cookie-based client — used only to verify the caller's identity and admin status.
 * Subject to RLS. READ ONLY.
 */
function getAuthClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
}

/**
 * Service-role client — bypasses RLS entirely.
 * Used for admin write operations (inserting purchases for any user, etc.)
 *
 * The key must be the SERVICE ROLE JWT (starts with "eyJ...") from
 * Supabase Dashboard › Settings › API › Project API keys › service_role.
 *
 * If only a Management PAT (sbp_...) is present we fall back to anon key
 * and these writes will be blocked by RLS — update .env.local / Netlify env vars.
 */
function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const isServiceJwt = serviceKey.startsWith('eyJ');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isServiceJwt ? serviceKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return data?.is_admin === true;
}

// ─── GET — List all users with their purchases ────────────────────────────────
export async function GET(request: NextRequest) {
  const authClient  = getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user || !(await isAdmin(authClient, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Use service client so we can read all profiles regardless of RLS
  const db = getServiceClient();

  const { data: profiles, error: profilesError } = await db
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const { data: purchases, error: purchasesError } = await db
    .from('purchases')
    .select(`
      *,
      movies:movie_id (id, title)
    `)
    .order('created_at', { ascending: false });

  if (purchasesError) {
    return NextResponse.json({ error: purchasesError.message }, { status: 500 });
  }

  const profilesWithPurchases = (profiles || []).map((profile) => ({
    ...profile,
    purchases: (purchases || []).filter((p: any) => p.user_id === profile.id),
  }));

  return NextResponse.json({ users: profilesWithPurchases });
}

// ─── PATCH — Update a user's profile (e.g. toggle is_admin) ──────────────────
export async function PATCH(request: NextRequest) {
  const authClient = getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user || !(await isAdmin(authClient, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  // Use service client to bypass RLS on profiles
  const db = getServiceClient();

  const { data: profile, error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

// ─── POST — Manually grant access to a user (admin-created purchase) ─────────
export async function POST(request: NextRequest) {
  const authClient = getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user || !(await isAdmin(authClient, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { userId, type, movieId } = await request.json();

  if (!userId || !type) {
    return NextResponse.json({ error: 'userId and type required' }, { status: 400 });
  }

  if (!['single', 'full'].includes(type)) {
    return NextResponse.json({ error: 'type must be "single" or "full"' }, { status: 400 });
  }

  if (type === 'single' && !movieId) {
    return NextResponse.json({ error: 'movieId required for single access' }, { status: 400 });
  }

  // ✅ Use service client — bypasses RLS so we can insert for any userId
  const db = getServiceClient();

  const { data: purchase, error } = await db
    .from('purchases')
    .insert({
      user_id: userId,
      movie_id: type === 'single' ? movieId : null,
      type,
      amount: 0,          // admin-granted, no charge
      status: 'verified',
      payment_method: 'admin_grant',
    })
    .select(`
      *,
      movies:movie_id (id, title)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ purchase });
}

// ─── DELETE — Revoke access (delete a purchase) ───────────────────────────────
export async function DELETE(request: NextRequest) {
  const authClient = getAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user || !(await isAdmin(authClient, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { purchaseId } = await request.json();

  if (!purchaseId) {
    return NextResponse.json({ error: 'purchaseId required' }, { status: 400 });
  }

  // ✅ Use service client — bypasses RLS so we can delete any purchase
  const db = getServiceClient();

  const { error } = await db
    .from('purchases')
    .delete()
    .eq('id', purchaseId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
