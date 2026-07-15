"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, AlertCircle, LogIn } from "lucide-react";
import { SITE_NAME } from "@/config/constants";

const ACCENT = "#C49A82";

export default function ProfissionalLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setErrorMsg("Preencha o email e a senha.");
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

      router.push("/profissional/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro inesperado. Tente novamente.");
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
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: ACCENT }}
            >
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h1
                className="text-2xl text-[#2B2723]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                {SITE_NAME}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Acesso para profissionais
              </p>
            </div>
          </div>

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
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white transition-colors"
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                Senha
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
                  Entrar
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
