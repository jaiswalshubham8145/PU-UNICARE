import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { TABLES } from "@/config/constants";

type AppRole = Database['public']['Enums']['app_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  activeRole: AppRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setActiveRole: (role: AppRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);

  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from(TABLES.USER_ROLES)
      .select('role')
      .eq('user_id', userId);

    if (!error && data) {
      setRoles(data.map(r => r.role));
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer role fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRoles([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    // Log full response for debugging signup DB errors
    // (the UI shows only error.message; this helps capture server details in console)
     
    console.debug("supabase.signUp response:", { data, error });

    if (error) {
       
      console.error("SignUp error:", error);
      return { error: error as Error };
    }

    // Insert profile and role if user was created
    if (data.user) {
      // Profile and role creation are handled server-side by DB triggers.
      // Avoid inserting here to prevent duplicate unique constraint errors
      // if the trigger already created these records.
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    setActiveRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, activeRole, signIn, signUp, signOut, setActiveRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getPrimaryDashboard = (roles: AppRole[]): string => {
  if (roles.includes('admin')) return '/dashboard/admin';
  if (roles.includes('principal')) return '/dashboard/principal';
  if (roles.includes('hod')) return '/dashboard/hod';
  if (roles.includes('maintenance_staff')) return '/dashboard/maintenance';
  if (roles.includes('cr')) return '/dashboard/cr';
  if (roles.includes('faculty')) return '/dashboard/faculty';
  return '/dashboard/faculty';
};
