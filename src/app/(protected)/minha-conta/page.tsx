"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  Briefcase,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/config/constants";

export default function MinhaContaPage() {
  const router = useRouter();
  const { userProfile, loading: authLoading, signOut } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  // Initialize form fields once userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      setNome(userProfile.nome || "");
      setEmail(userProfile.email || "");
      setTelefone(userProfile.telefone || "");
      setCategoria(userProfile.categoria || "");
      setFotoUrl(userProfile.foto_url || "");
    }
  }, [userProfile]);

  // Fetch site configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const resConfig = await fetch("/api/configuracoes");
        if (resConfig.ok) {
          const configData = await resConfig.json();
          setConfig(configData);
        }
      } catch (e) {
        console.error("Erro ao carregar configurações", e);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    if (!nome.trim()) {
      setErrorMsg("O nome é obrigatório.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const url = userProfile.role === "profissional"
        ? `/api/profissionais/${userProfile.id}`
        : `/api/pacientes/${userProfile.id}`;

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-4 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const goBackUrl = userProfile?.role === "profissional" ? "/painel" : "/";
  const BREADCRUMBS = [
    { label: "Início" },
    { label: "Minha Conta", active: true },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <AppHeader
        userProfile={userProfile}
        onSignOut={signOut}
        backHref={goBackUrl}
        backLabel="Voltar"
        breadcrumbs={BREADCRUMBS}
      />

      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-5 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: "#C49A82" }} />

          <div className="mb-8">
            <h1
              className="text-2xl text-[#2B2723] font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Minha Conta
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Gerencie as informações básicas do seu perfil de acesso.
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
                  style={{ background: "#C49A82" }}
                >
                  {nome ? nome.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-neutral-800">{nome}</p>
                <p className="text-xs text-neutral-400 mt-0.5 capitalize">
                  Perfil: {userProfile?.role === "paciente" ? "Paciente" : `Profissional (${categoria})`}
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

            {userProfile?.role === "profissional" && (
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
                style={{ background: "#C49A82" }}
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
