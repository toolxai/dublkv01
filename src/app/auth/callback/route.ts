import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && user) {
      // Ensure user profile exists in public.profiles table
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: name,
          avatar_url: avatarUrl,
        }, { onConflict: 'id' });
      } catch (err) {
        console.warn('Profile sync warning in callback:', err);
      }

      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('[auth/callback] error:', error?.message)
      // Redirect to homepage with error
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error?.message || 'Authentication failed')}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/`)
}
