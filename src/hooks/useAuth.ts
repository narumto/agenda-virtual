"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

interface UseAuthReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && active) {
          setUserProfile({
            nome:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              "Usuário",
            foto_url:
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture ||
              "",
          });
        }
      } catch {
        // Session fetch failed — user remains null
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("google_login_role");
    router.push("/login");
  }, [router]);

  return { userProfile, loading, signOut };
}
