import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

// POST - Activate 3-day free trial for a signed-in user
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Sign in required to activate free trial' }, { status: 401 });
  }

  // Get current profile to check if already used trial
  const { data: profile } = await supabase
    .from('profiles')
    .select('free_trial_started_at, free_trial_expires_at')
    .eq('id', user.id)
    .single();

  if (profile?.free_trial_started_at) {
    const expiry = profile.free_trial_expires_at
      ? new Date(profile.free_trial_expires_at)
      : new Date(0);
    const isActive = expiry > new Date();
    return NextResponse.json({
      error: isActive
        ? 'You already have an active free trial'
        : 'Your free trial has already expired',
      trialExpired: !isActive,
    }, { status: 409 });
  }

  // Grant 3-day free trial
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      free_trial_started_at: now.toISOString(),
      free_trial_expires_at: expiresAt.toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    expiresAt: expiresAt.toISOString(),
    message: 'Free trial activated! Enjoy 3 days of unlimited access.',
  });
}

// GET - Check current free trial status
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasTrial: false, isActive: false });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('free_trial_started_at, free_trial_expires_at')
    .eq('id', user.id)
    .single();

  const hasTrial = !!profile?.free_trial_started_at;
  const isActive = profile?.free_trial_expires_at
    ? new Date(profile.free_trial_expires_at) > new Date()
    : false;

  return NextResponse.json({
    hasTrial,
    isActive,
    expiresAt: profile?.free_trial_expires_at || null,
  });
}
