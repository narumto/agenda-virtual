"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, AlertCircle, LogIn } from "lucide-react";
import { SITE_NAME } from "@/config/constants";

const ACCENT = "#C49A82";

export default function ProfissionalLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/configuracoes");
        if (res.ok) {
          const configData = await res.json();
          setConfig(configData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchConfig();
  }, []);

  const handleEmailBlur = async () => {
    if (!email.trim() || !email.includes("@")) return;
    try {
      const res = await fetch("/api/profissionais/auth/verificar-cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNeedsPasswordSetup(data.needsPasswordSetup);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsPasswordSetup) {
      handleConfigurarSenha(e);
      return;
    }

    if (!email.trim() || !senha.trim()) {
      setErrorMsg("Preencha o email e a palavra-passe.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profissionais/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }

      window.location.href = "/painel";
    } catch (err: any) {
      setErrorMsg(err.message || "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurarSenha = async (e: React.FormEvent) => {
    if (!senha.trim() || !confirmarSenha.trim()) {
      setErrorMsg("Preencha todos os campos da palavra-passe.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErrorMsg("As palavras-passe não coincidem.");
      return;
    }
    if (senha.length < 8) {
      setErrorMsg("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profissionais/auth/configurar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erro ao configurar a palavra-passe.");
      }

      window.location.href = "/painel";
    } catch (err: any) {
      setErrorMsg(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: "#FAF9F6", fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="h-1 w-full" style={{ background: ACCENT }} />

        <div className="px-8 py-9 space-y-7">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src={config?.logo_url || "/logo.png"}
              alt="Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-1 ring-neutral-200 shrink-0"
            />
            <div>
              <h1
                className="text-2xl text-[#2B2723]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                {config?.nome_site || SITE_NAME}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Acesso para profissionais
              </p>
            </div>
          </div>

          {needsPasswordSetup && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs leading-relaxed">
              <strong>Olá!</strong> O seu acesso já foi liberado pelo administrador. Defina a sua palavra-passe abaixo para concluir o seu registo e aceder ao painel.
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onBlur={handleEmailBlur}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white transition-colors"
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlurCapture={handleEmailBlur}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                {needsPasswordSetup ? "Definir Palavra-passe (mínimo 8 caracteres)" : "Palavra-passe"}
              </label>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErrorMsg(null); }}
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white transition-colors"
                  onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {needsPasswordSetup && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                  Confirmar Palavra-passe
                </label>
                <input
                  type={showSenha ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => { setConfirmarSenha(e.target.value); setErrorMsg(null); }}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white transition-colors"
                  onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-2 shadow-sm"
              style={{ background: ACCENT, letterSpacing: "0.03em" }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  {needsPasswordSetup ? "Concluir Registo & Entrar" : "Entrar"}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-neutral-400 leading-relaxed">
            Não tem acesso?{" "}
            <span className="font-medium text-neutral-500">
              Fale com o administrador.
            </span>
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-neutral-300">
        Área restrita — acesso apenas para a equipa
      </p>
    </div>
  );
}
