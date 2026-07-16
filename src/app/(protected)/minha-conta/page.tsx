"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  Briefcase,
  CalendarDays,
  LogOut,
  Sparkles,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SITE_NAME } from "@/config/constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const ACCENT = "#C49A82";
const ACCENT_LIGHT = "#F5EDE6";

export default function MinhaContaPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [role, setRole] = useState<"paciente" | "profissional" | null>(null);
  const [userId, setUserId] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [categoria, setCategoria] = useState(""); 
  const [fotoUrl, setFotoUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setRole("paciente");
          const savedRole = localStorage.getItem("google_login_role") || "paciente";
          
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              google_id: session.user.id,
              nome: session.user.user_metadata?.full_name || "Usuário",
              foto_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
              role: savedRole,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Erro ao obter perfil");
          
          setUserId(data.data.id);
          setNome(data.data.nome);
          setEmail(data.data.email || session.user.email || "");
          setTelefone(data.data.telefone || "");
          setFotoUrl(session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "");
        } else {
          const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
          if (!res.ok) {
            router.push("/login");
            return;
          }

          const data = await res.json();
          if (data.authenticated && data.data) {
            setRole("profissional");
            setUserId(data.data.id);
            setNome(data.data.nome);
            setEmail(data.data.email || "");
            setTelefone(data.data.telefone || "");
            setCategoria(data.data.categoria || "funcionario");
            setFotoUrl(data.data.foto_url || "");
          } else {
            router.push("/login");
            return;
          }
        }

        const resConfig = await fetch("/api/configuracoes");
        if (resConfig.ok) {
          const configData = await resConfig.json();
          setConfig(configData);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Não foi possível recuperar seus dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    if (role === "profissional") {
      await fetch("/api/profissionais/auth", { method: "DELETE" });
      window.location.href = "/profissional/login";
    } else {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMsg("O nome é obrigatório.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const url = role === "profissional" 
        ? `/api/profissionais/${userId}` 
        : `/api/pacientes/${userId}`;
      
      const payload = {
        nome: nome.trim(),
        telefone: telefone.trim() || "",
      };

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao salvar perfil");

      setSuccessMsg("Dados atualizados com sucesso!");
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro ao atualizar os seus dados.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-4 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const goBackUrl = role === "profissional" ? "/painel" : "/";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(goBackUrl)}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors group cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Voltar</span>
            </button>

            <div className="w-px h-5 bg-neutral-200" />

            <div className="flex items-center gap-2.5">
              <img
                src={config?.logo_url || "/logo.png"}
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-neutral-200 shrink-0"
              />
              <span
                className="text-[15px] text-neutral-900 font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {config?.nome_site || SITE_NAME}
              </span>
            </div>
          </div>

          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex items-center rounded-full cursor-pointer focus:outline-none group relative border-none bg-transparent"
            >
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-[#C49A82]/20 group-hover:ring-[#C49A82]/50 transition-all"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm ring-2 ring-[#C49A82]/20 group-hover:ring-[#C49A82]/50 transition-all"
                  style={{ background: ACCENT }}
                >
                  {nome ? nome.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-400`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-neutral-50">
                  <p className="text-xs text-neutral-400 mb-0.5">Logado como</p>
                  <p className="text-sm font-semibold text-neutral-800 truncate">{nome || "Usuário"}</p>
                </div>
                <div className="py-1.5">
                  {role === "profissional" && (
                    <button
                      onClick={() => { setDropdownOpen(false); router.push("/painel"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer text-amber-800 border-none bg-transparent"
                    >
                      <Sparkles size={15} className="text-amber-600" />
                      Painel Administrativo
                    </button>
                  )}
                  {role === "paciente" && (
                    <button
                      onClick={() => { setDropdownOpen(false); router.push("/meus-agendamentos"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer border-none bg-transparent"
                      style={{ color: ACCENT }}
                    >
                      <CalendarDays size={15} style={{ color: ACCENT }} />
                      Meus Agendamentos
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <LogOut size={15} className="text-rose-400" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-5 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: ACCENT }} />

          <div className="mb-8">
            <h1
              className="text-2xl text-[#2B2723] font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Minha Conta
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Gira as informações básicas do seu perfil de acesso.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3.5 rounded-2xl text-sm font-medium">
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-2xl text-sm font-medium">
              <CheckCircle2 size={17} className="shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-neutral-200"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium shadow-sm"
                  style={{ background: ACCENT }}
                >
                  {nome ? nome.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-neutral-800">{nome}</p>
                <p className="text-xs text-neutral-400 mt-0.5 capitalize">
                  Perfil: {role === "paciente" ? "Paciente" : `Profissional (${categoria})`}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Nome Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 pl-11 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-sm text-neutral-800 focus:outline-none focus:bg-white focus:border-[#C49A82] transition-colors"
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                E-mail (Não editável)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-3 pl-11 rounded-2xl border border-neutral-200 bg-neutral-100/70 text-sm text-neutral-500 cursor-not-allowed"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Telemóvel / Telefone
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: 912345678"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-4 py-3 pl-11 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-sm text-neutral-800 focus:outline-none focus:bg-white focus:border-[#C49A82] transition-colors"
                />
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {role === "profissional" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                  Função / Cargo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={categoria}
                    className="w-full px-4 py-3 pl-11 rounded-2xl border border-neutral-200 bg-neutral-100/70 text-sm text-neutral-500 cursor-not-allowed capitalize"
                  />
                  <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-2.5 sm:gap-4">
              <button
                type="button"
                onClick={() => router.push(goBackUrl)}
                className="flex-1 py-2.5 sm:py-3.5 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 sm:py-3.5 rounded-full text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60 shadow-sm cursor-pointer"
                style={{ background: ACCENT }}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} className="shrink-0" />
                    <span>Salvar<span className="hidden sm:inline"> Alterações</span></span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
