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
        if (session?.user) {
          if (active) {
            setUserProfile({
              nome:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                "Usuário",
              foto_url:
                session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture ||
                "",
              role: "paciente",
            });
          }
        } else {
          const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && active) {
              setUserProfile({
                nome: data.data.nome,
                foto_url: data.data.foto_url || "",
                role: "profissional",
              });
            }
          }
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
    if (userProfile?.role === "profissional") {
      await fetch("/api/profissionais/auth", { method: "DELETE" });
      window.location.href = "/profissional/login";
    } else {
      await supabase.auth.signOut();
      localStorage.removeItem("google_login_role");
      router.push("/login");
    }
  }, [router, userProfile]);

  return { userProfile, loading, signOut };
}
