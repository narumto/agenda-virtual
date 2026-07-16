"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session) {
          const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              if (active) {
                setLoading(false);
              }
              return;
            }
          }
          if (active) {
            router.push("/login");
          }
        } else {
          if (active) setLoading(false);
        }
      } catch {
        if (active) router.push("/login");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        try {
          const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              return;
            }
          }
        } catch (e) {
          console.error(e);
        }

        if (active) {
          router.push("/login");
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
