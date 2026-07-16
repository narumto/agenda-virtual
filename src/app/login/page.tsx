"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { siteConfig, ACCENT } from "@/config/constants";
import type { UserProfile } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"paciente" | "profissional">("paciente");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Sync session and handle verify on load or redirects
  useEffect(() => {
    let active = true;

    const checkSessionAndVerify = async () => {
      setErrorMsg(null);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          // Usuário já está logado — redirecionar imediatamente sem renderizar login
          router.replace("/");
          return;
        }
      } catch (err: any) {
        if (active) {
          setErrorMsg(err.message || "Erro ao recuperar sessão.");
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    };

    checkSessionAndVerify();

    // Listen for auth state changes (e.g. SIGNED_IN after OAuth redirect flow)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        if (active) {
          setSessionUser(session.user);
          await handleApiVerify(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        if (active) {
          setSessionUser(null);
          setUserProfile(null);
          setSuccessMsg(null);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleApiVerify = async (user: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Retrieve the selected role from localStorage to handle state loss across redirect
    const savedRole = localStorage.getItem("google_login_role") || "paciente";

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          google_id: user.id,
          nome:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Usuário Google",
          foto_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            "",
          role: savedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro de autenticação local");
      }

      if (data.role) {
        setRole(data.role);
      }
      setUserProfile(data.data);

      if (data.isNewUser) {
        setSuccessMsg("Cadastro realizado com sucesso! Redirecionando...");
      } else {
        setSuccessMsg("Login realizado com sucesso! Redirecionando...");
      }

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(
        err.message || "Não foi possível sincronizar sua conta com a API.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      // Save selected role before redirecting
      localStorage.setItem("google_login_role", role);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(
        err.message || "Não foi possível iniciar o login com o Google.",
      );
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("google_login_role");
      setSessionUser(null);
      setUserProfile(null);
      setSuccessMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao realizar logout.");
    } finally {
      setIsLoading(false);
    }
  };

  // Enquanto verifica sessão, não renderiza nada para evitar flash do formulário
  if (checkingSession) return null;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#FAF9F6] font-sans">
      {/* Lado Esquerdo: Imagem (Desktop) */}
      <div className="hidden md:block relative w-full h-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80"
          alt="Clínica de Estética e Spa"
          className="w-full h-full object-cover select-none pointer-events-none filter brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#2B2723]/40 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h1
            className="text-4xl lg:text-5xl font-medium tracking-tight leading-tight mb-4 drop-shadow-md"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Cuide de si, <br />
            Viva o seu bem-estar.
          </h1>
          <p className="text-white/80 max-w-md text-sm lg:text-base leading-relaxed font-light">
            Procedimentos estéticos personalizados com profissionais
            qualificados. Acesse e agende o seu momento.
          </p>
        </div>
      </div>

      {/* Lado Direito: Interface Principal */}
      <div className="flex flex-col justify-center items-center px-6 py-12 md:px-12 lg:px-20 relative min-h-screen">
        {/* Banner de Erro */}
        {errorMsg && (
          <div className="w-full max-w-md absolute top-6 left-6 right-6 md:left-auto md:right-auto bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-start gap-3 shadow-md animate-fade-in z-50">
            <svg
              className="w-5 h-5 shrink-0 mt-0.5 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="text-sm font-medium">{errorMsg}</div>
            <button
              onClick={() => setErrorMsg(null)}
              className="ml-auto text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Banner de Sucesso */}
        {successMsg && (
          <div className="w-full max-w-md absolute top-6 left-6 right-6 md:left-auto md:right-auto bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-start gap-3 shadow-md animate-fade-in z-50">
            <svg
              className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm font-medium">{successMsg}</div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="ml-auto text-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="w-full max-w-md space-y-10">
          {/* Logo e Cabeçalho */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            <img
              src={siteConfig.logoUrl}
              alt={siteConfig.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-md ring-4 ring-[#C49A82]/10"
            />
            <div className="space-y-3">
              <h2
                className="text-3xl lg:text-4xl text-[#2B2723] font-medium"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {sessionUser ? "Sua Conta" : "Acesse sua Conta"}
              </h2>
              <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
                {sessionUser
                  ? "Você está autenticado no portal de agendamentos."
                  : `Bem-vindo ao ${siteConfig.name}. Escolha sua opção de acesso e faça login com segurança.`}
              </p>
            </div>
          </div>

          {/* Estado: Logado */}
          {sessionUser ? (
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-md space-y-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <img
                  src={
                    sessionUser.user_metadata?.avatar_url ||
                    sessionUser.user_metadata?.picture ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
                  }
                  alt={userProfile?.nome || "Usuário"}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-[#C49A82]/20"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-neutral-800 truncate">
                    {userProfile?.nome ||
                      sessionUser.user_metadata?.full_name ||
                      "Usuário Google"}
                  </h3>
                  <p className="text-sm text-neutral-500 truncate">
                    {sessionUser.email}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Tipo de Perfil:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#C49A82]/10 text-[#2B2723]">
                    {role === "paciente" ? "Paciente" : "Profissional"}
                  </span>
                </div>
                {(userProfile as any)?.telefone && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Telefone:</span>
                    <span className="text-neutral-700 font-medium">
                      {(userProfile as any).telefone}
                    </span>
                  </div>
                )}
                {role === "profissional" &&
                  (userProfile as any)?.status_acesso && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-400">
                        Status de Liberação:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${
                          (userProfile as any).status_acesso === "ativo"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {(userProfile as any).status_acesso}
                      </span>
                    </div>
                  )}
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 active:scale-[0.98] text-neutral-700 rounded-full font-medium text-sm transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                )}
                <span>Sair da Conta</span>
              </button>
            </div>
          ) : (
            /* Estado: Não Logado */
            <div className="space-y-6">
              {/* Seletor de Perfil (Role) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
                  Acessar como:
                </label>
                <div className="grid grid-cols-2 p-1.5 bg-neutral-100 rounded-full relative">
                  <button
                    type="button"
                    onClick={() => setRole("paciente")}
                    className={`py-2 text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer relative z-10 ${
                      role === "paciente"
                        ? "text-[#2B2723] bg-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    Paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/profissional/login")}
                    className="py-2 text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer relative z-10 text-neutral-500 hover:text-neutral-700"
                  >
                    Profissional
                  </button>
                </div>
              </div>

              {/* Botão Google Login */}
              <button
                id="btn-google-login"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-white hover:bg-neutral-50 active:scale-[0.98] border border-neutral-200 hover:border-neutral-300 rounded-full text-neutral-700 font-medium text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {isLoading ? "Processando..." : "Continuar com o Google"}
                </span>
              </button>
            </div>
          )}

          {/* Rodapé Legal */}
          <div className="text-center md:text-left pt-6 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mx-auto md:mx-0">
              Sua privacidade é muito importante para nós. Ao continuar, você
              declara concordar com nossos{" "}
              <a href="#" className="text-[#C49A82] hover:underline">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="#" className="text-[#C49A82] hover:underline">
                Políticas de Privacidade
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
