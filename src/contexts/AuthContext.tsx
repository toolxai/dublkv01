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

  // Singleton Supabase browser client
  const supabase = createClient();

  // Atomically fetch profile role from Supabase
  const fetchProfileRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        return { isAdm: false, userRole: 'user' as UserRole, canM: false };
      }

      const isAdm = Boolean(data.is_admin === true || data.role === 'admin');
      const userRole: UserRole = (data.role as UserRole) || (isAdm ? 'admin' : 'user');
      const canM = isAdm || userRole === 'editor' || userRole === 'moderator';

      return { isAdm, userRole, canM };
    } catch (err) {
      console.error('[fetchProfileRole] error:', err);
      return { isAdm: false, userRole: 'user' as UserRole, canM: false };
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    // Synchronize both user session and profile roles atomically before clearing isLoading
    const syncUserAndRole = async (currentSession: Session | null) => {
      const currentUser = currentSession?.user ?? null;

      let isAdm = false;
      let userRole: UserRole = 'user';
      let canM = false;

      if (currentUser) {
        const res = await fetchProfileRole(currentUser.id);
        isAdm = res.isAdm;
        userRole = res.userRole;
        canM = res.canM;
      }

      if (isMounted) {
        setSession(currentSession);
        setUser(currentUser);
        setIsAdmin(isAdm);
        setRole(userRole);
        setCanMaintain(canM);
        setIsLoading(false);
      }
    };

    // Initial session retrieval
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      await syncUserAndRole(initialSession);
      previousUserRef.current = initialSession?.user ?? null;
      initialLoadRef.current = false;
    });

    // Handle authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        const prevUser = previousUserRef.current;
        const newUser = currentSession?.user ?? null;

        await syncUserAndRole(currentSession);

        // Toast notifications for explicit sign-in / sign-out events (only after initial load)
        if (!initialLoadRef.current) {
          if (!prevUser && newUser && event === 'SIGNED_IN') {
            const name = newUser.user_metadata?.full_name || newUser.email?.split('@')[0] || '';
            showToastGlobal(`Welcome${name ? `, ${name}` : ''}! You're signed in.`, 'success');
          } else if (prevUser && !newUser && event === 'SIGNED_OUT') {
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
  }, [supabase, fetchProfileRole]);

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
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[signOut] error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setRole('user');
      setCanMaintain(false);
      setIsLoading(false);
      previousUserRef.current = null;
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
