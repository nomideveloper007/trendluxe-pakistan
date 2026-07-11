import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { fetchIsAdmin } from "@/lib/user-data";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshAdmin: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
  refreshAdmin: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function loadAdmin(userId: string | undefined) {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    try {
      setIsAdmin(await fetchIsAdmin(userId));
    } catch {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
        void loadAdmin(s?.user?.id);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      void loadAdmin(data.session?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  const refreshAdmin = async () => loadAdmin(session?.user?.id);

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, loading, isAdmin, refreshAdmin }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
