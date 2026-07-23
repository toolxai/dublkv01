import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        role: 'user',
        isAdmin: false,
        canMaintain: false,
      });
    }

    // Use service role client if available to bypass RLS and guarantee reading profile & is_admin
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const isServiceJwt = serviceKey.startsWith('eyJ');
    const dbClient = isServiceJwt
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : supabase;

    const { data: profile } = await dbClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const isAdm = Boolean(profile?.is_admin === true || profile?.role === 'admin');
    const userRole = (profile?.role as string) || (isAdm ? 'admin' : 'user');
    const canMaintain = isAdm || userRole === 'editor' || userRole === 'moderator';

    return NextResponse.json({
      authenticated: true,
      user,
      role: userRole,
      isAdmin: isAdm,
      canMaintain,
    });
  } catch (err) {
    console.error('[api/auth/me] error:', err);
    return NextResponse.json({
      authenticated: false,
      user: null,
      role: 'user',
      isAdmin: false,
      canMaintain: false,
    });
  }
}
