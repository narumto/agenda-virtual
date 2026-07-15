"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles, User, Calendar } from "lucide-react";
import { SITE_NAME } from "@/config/constants";

const ACCENT = "#C49A82";

export default function ProfessionalDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/profissionais/auth");
        if (!res.ok) {
          router.push("/profissional/login");
          return;
        }
        const data = await res.json();
        setProfile(data.data);
      } catch (err) {
        router.push("/profissional/login");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/profissionais/auth", { method: "DELETE" });
      router.push("/profissional/login");
    } catch (err) {
      console.error("Erro ao fazer logout", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-4 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: ACCENT }}>
              <Sparkles size={14} className="text-white" />
            </div>
            <span
              className="text-[15px] text-neutral-900"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              {SITE_NAME} — Painel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 font-medium">
              Olá, {profile?.nome} ({profile?.categoria})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl border border-neutral-200/60 p-8 shadow-sm space-y-6">
          <h2
            className="text-2xl text-[#2B2723]"
            style={{ fontFamily: "'Playfair Display', serif', fontWeight: 500" }}
          >
            Área do Profissional
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Bem-vindo ao seu painel. Em breve você poderá gerenciar seus agendamentos, horários e configurações aqui.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#F5EDE6] flex items-center justify-center text-[#C49A82]">
                <Calendar size={20} />
              </div>
              <h3 className="font-semibold text-neutral-800">Ver Agenda</h3>
              <p className="text-xs text-neutral-500">Visualize seus compromissos futuros.</p>
            </div>
            <div className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#F5EDE6] flex items-center justify-center text-[#C49A82]">
                <User size={20} />
              </div>
              <h3 className="font-semibold text-neutral-800">Seu Perfil</h3>
              <p className="text-xs text-neutral-500">Gerencie suas informações pessoais.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
