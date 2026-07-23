'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showToastGlobal } from '@/components/ui/Toast';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'editor' | 'moderator' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  role: UserRole;
  canMaintain: boolean;
  showAuthModal: boolean;
  authModalCallback: (() => void) | null;
  openAuthModal: (callback?: () => void) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  role: 'user',
  canMaintain: false,
  showAuthModal: false,
  authModalCallback: null,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<UserRole>('user');
  const [canMaintain, setCanMaintain] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalCallback, setAuthModalCallback] = useState<(() => void) | null>(null);
  const previousUserRef = useRef<User | null>(null);
  const initialLoadRef = useRef(true);

  const supabase = createClient();

  // Save auth state to instant local cache for 0ms page hydration
  const updateAuthCache = useCallback((u: User | null, r: UserRole, isAdm: boolean, maintain: boolean) => {
    try {
      if (u) {
        localStorage.setItem('dublk_auth_cache', JSON.stringify({
          user: u,
          role: r,
          isAdmin: isAdm,
          canMaintain: maintain,
          timestamp: Date.now(),
        }));
      } else {
        localStorage.removeItem('dublk_auth_cache');
      }
    } catch {}
  }, []);

  // Try loading instant cache on mount (0ms latency)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('dublk_auth_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.user) {
          setUser(parsed.user);
          setRole(parsed.role || 'user');
          setIsAdmin(Boolean(parsed.isAdmin));
          setCanMaintain(Boolean(parsed.canMaintain));
          setIsLoading(false); // Instant 0ms hydration!
        }
      }
    } catch {}
  }, []);

  const syncServerAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          const u = data.user;
          const r = (data.role || 'user') as UserRole;
          const isAdm = Boolean(data.isAdmin);
          const maintain = Boolean(data.canMaintain);

          setUser(u);
          setRole(r);
          setIsAdmin(isAdm);
          setCanMaintain(maintain);
          updateAuthCache(u, r, isAdm, maintain);
          return true;
        }
      }
    } catch (err) {
      console.error('[syncServerAuth] error:', err);
    }
    return false;
  }, [updateAuthCache]);

  const checkRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        return;
      }

      const isAdm = Boolean(data.is_admin === true || data.role === 'admin');
      const userRole: UserRole = (data.role as UserRole) || (isAdm ? 'admin' : 'user');
      const maintain = isAdm || userRole === 'editor' || userRole === 'moderator';

      setIsAdmin(isAdm);
      setRole(userRole);
      setCanMaintain(maintain);
      if (user) {
        updateAuthCache(user, userRole, isAdm, maintain);
      }
    } catch (err) {
      console.error('[checkRole] error:', err);
    }
  }, [supabase, user, updateAuthCache]);

  useEffect(() => {
    let isMounted = true;

    const handleSession = async (currentSession: Session | null) => {
      const currentUser = currentSession?.user ?? null;
      setSession(currentSession);

      // Fast-path: If client has user, resolve state fast
      if (currentUser) {
        setUser(currentUser);
        // Sync server auth and DB role in parallel
        Promise.all([
          syncServerAuth(),
          checkRole(currentUser.id),
        ]).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        // Fallback: Check server-side cookies for HttpOnly session
        const serverSuccess = await syncServerAuth();
        if (!serverSuccess) {
          setUser(null);
          setIsAdmin(false);
          setRole('user');
          setCanMaintain(false);
          updateAuthCache(null, 'user', false, false);
        }
        if (isMounted) setIsLoading(false);
      }
    };

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        handleSession(session).then(() => {
          previousUserRef.current = session?.user ?? null;
          initialLoadRef.current = false;
        });
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        const prevUser = previousUserRef.current;
        const newUser = session?.user ?? null;

        await handleSession(session);

        if (!initialLoadRef.current) {
          if (!prevUser && newUser) {
            const name = newUser.user_metadata?.full_name || newUser.email?.split('@')[0] || '';
            showToastGlobal(`Welcome${name ? `, ${name}` : ''}! You're signed in.`, 'success');
          } else if (prevUser && !newUser) {
            showToastGlobal('You have been signed out successfully.', 'info');
          }
        }

        previousUserRef.current = newUser;
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, checkRole, syncServerAuth, updateAuthCache]);

  // When user logs in and there's a pending callback, execute it
  useEffect(() => {
    if (user && authModalCallback) {
      setShowAuthModal(false);
      authModalCallback();
      setAuthModalCallback(null);
    }
  }, [user, authModalCallback]);

  const openAuthModal = useCallback((callback?: () => void) => {
    if (callback) {
      setAuthModalCallback(() => callback);
    }
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    setAuthModalCallback(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[signOut] error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setRole('user');
      setCanMaintain(false);
      updateAuthCache(null, 'user', false, false);
      previousUserRef.current = null;
      window.location.href = '/';
    }
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        role,
        canMaintain,
        showAuthModal,
        authModalCallback,
        openAuthModal,
        closeAuthModal,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
