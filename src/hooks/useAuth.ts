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
          const savedRole = localStorage.getItem("google_login_role") || "paciente";
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              google_id: session.user.id,
              nome:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                "Usuário Google",
              foto_url:
                session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture ||
                "",
              role: savedRole,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (active) {
              setUserProfile({
                id: data.data.id,
                nome: data.data.nome,
                email: data.data.email || session.user.email || "",
                telefone: data.data.telefone || "",
                foto_url:
                  session.user.user_metadata?.avatar_url ||
                  session.user.user_metadata?.picture ||
                  "",
                role: "paciente",
              });
            }
          }
        } else {
          const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && active) {
              setUserProfile({
                id: data.data.id,
                nome: data.data.nome,
                email: data.data.email || "",
                telefone: data.data.telefone || "",
                categoria: data.data.categoria || "funcionario",
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
      window.location.href = "/login?role=profissional";
    } else {
      await supabase.auth.signOut();
      localStorage.removeItem("google_login_role");
      router.push("/login");
    }
  }, [router, userProfile]);

  return { userProfile, loading, signOut };
}
