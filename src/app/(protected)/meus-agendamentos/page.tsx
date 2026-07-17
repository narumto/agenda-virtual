"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Banknote,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ACCENT, ACCENT_LIGHT } from "@/config/constants";
import type { Agendamento, AgendamentoStatus } from "@/types";

const STATUS_CONFIG: Record<
  AgendamentoStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  PENDENTE: {
    label: "Pendente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  CONFIRMADO: {
    label: "Confirmado",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  CONCLUIDO: {
    label: "Concluído",
    bg: "bg-neutral-100",
    text: "text-neutral-600",
    dot: "bg-neutral-400",
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "bg-rose-50",
    text: "text-rose-600",
    dot: "bg-rose-400",
  },
  FALTOU: {
    label: "Faltou",
    bg: "bg-orange-50",
    text: "text-orange-600",
    dot: "bg-orange-400",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUpcoming(iso: string, status: AgendamentoStatus) {
  return (
    (status === "PENDENTE" || status === "CONFIRMADO") &&
    new Date(iso) >= new Date()
  );
}

// ── Card component ──
function AgendamentoCard({
  agendamento: a,
  onCancel,
  cancelling,
  showCancel,
}: {
  agendamento: Agendamento;
  onCancel?: () => void;
  cancelling?: boolean;
  showCancel: boolean;
}) {
  const cfg = STATUS_CONFIG[a.status];
  const serviceName = a.servico?.nome || "Serviço";
  const preco = a.servico?.preco;
  const duracao = a.servico?.duracao_minutos;

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Top accent + status */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-50">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-[11px] text-neutral-400">
          #{a.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 py-4 flex-1 space-y-3">
        <h3
          className="font-semibold text-neutral-800 text-base leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {serviceName}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <CalendarDays
              size={13}
              style={{ color: ACCENT }}
              className="shrink-0"
            />
            <span className="capitalize">{formatDate(a.inicio)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock
              size={13}
              style={{ color: ACCENT }}
              className="shrink-0"
            />
            <span>
              {formatTime(a.inicio)}
              {duracao ? ` · ${duracao} min` : ""}
            </span>
          </div>
          {preco !== undefined && (
            <div
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: ACCENT }}
            >
              <Banknote size={13} className="shrink-0" />
              <span>€ {preco}</span>
            </div>
          )}
        </div>

        {a.observacao && (
          <p className="text-xs text-neutral-400 italic border-t border-neutral-50 pt-3 leading-relaxed">
            &quot;{a.observacao}&quot;
          </p>
        )}
      </div>

      {/* Cancel button */}
      {showCancel && a.status !== "CANCELADO" && (
        <div className="px-5 pb-4">
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="w-full py-2.5 rounded-full border border-rose-200 text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {cancelling ? (
              <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <X size={13} />
                Cancelar agendamento
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Empty state ──
function EmptyState({
  label,
  sub,
  action,
}: {
  label: string;
  sub: string;
  action?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: ACCENT_LIGHT }}
      >
        <CalendarDays size={28} style={{ color: ACCENT }} />
      </div>
      <p className="text-neutral-700 font-medium mb-1">{label}</p>
      <p className="text-sm text-neutral-400 mb-5">{sub}</p>
      {action && (
        <button
          onClick={action}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:brightness-105 active:scale-95 cursor-pointer"
          style={{ background: ACCENT }}
        >
          Ver serviços <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

export default function MeusAgendamentosPage() {
  const router = useRouter();
  const { userProfile, signOut } = useAuth();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let userEmail = "";
        let googleId = "";
        let userName = "";
        let userFoto = "";
        let isPro = false;

        if (session?.user) {
          userEmail = session.user.email || "";
          googleId = session.user.id;
          userName = session.user.user_metadata?.full_name || "Usuário";
          userFoto = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "";
        } else {
          const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              isPro = true;
            } else {
              router.push("/login");
              return;
            }
          } else {
            router.push("/login");
            return;
          }
        }

        if (!isPro) {
          const savedRole = localStorage.getItem("google_login_role") || "paciente";
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              google_id: googleId,
              nome: userName,
              foto_url: userFoto,
              role: savedRole,
            }),
          });
          const userData = await res.json();
          if (!res.ok) throw new Error(userData.message);

          const pid = userData.data.id;
          const resAg = await fetch(`/api/agendamentos?paciente_id=${pid}`);
          if (!resAg.ok) throw new Error("Erro ao carregar agendamentos");
          const agData = await resAg.json();
          setAgendamentos(agData);
        } else {
          setAgendamentos([]);
        }

        const resConfig = await fetch("/api/configuracoes");
        if (resConfig.ok) {
          const configData = await resConfig.json();
          setConfig(configData);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELADO" }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erro ao cancelar");
      }
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "CANCELADO" } : a,
        ),
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao cancelar agendamento.");
    } finally {
      setCancellingId(null);
      setConfirmCancel(null);
    }
  };

  const upcoming = agendamentos.filter((a) => isUpcoming(a.inicio, a.status));
  const history = agendamentos.filter((a) => !isUpcoming(a.inicio, a.status));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-4 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#FAF9F6]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <AppHeader
        userProfile={userProfile}
        onSignOut={signOut}
        backHref="/"
        backLabel="Início"
        maxWidth="max-w-6xl"
      />

      {/* Page title */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10 pb-6">
        <h1
          className="text-3xl text-[#2B2723] mb-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
          }}
        >
          Meus Agendamentos
        </h1>
        <p className="text-sm text-neutral-500">
          Acompanhe e gerencie seus horários agendados.
        </p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="max-w-6xl mx-auto px-6 md:px-10 mb-6">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {errorMsg}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 md:px-10 pb-16 space-y-12">
        {/* ── Próximos ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-neutral-800">
              Próximos
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5EDE6] text-[#C49A82]">
              {upcoming.length}
            </span>
            <div className="h-px flex-1 bg-neutral-200/60" />
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              label="Nenhum agendamento próximo"
              sub="Que tal agendar um serviço?"
              action={() => router.push("/")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {upcoming.map((a) => (
                <AgendamentoCard
                  key={a.id}
                  agendamento={a}
                  onCancel={() => setConfirmCancel(a.id)}
                  cancelling={cancellingId === a.id}
                  showCancel
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Histórico ── */}
        {history.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold text-neutral-800">
                Histórico
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-500">
                {history.length}
              </span>
              <div className="h-px flex-1 bg-neutral-200/60" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {history.map((a) => (
                <AgendamentoCard
                  key={a.id}
                  agendamento={a}
                  showCancel={false}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full space-y-5 animate-fade-in">
            <div className="flex items-start justify-between">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#FFF1F1" }}
              >
                <X size={22} className="text-rose-500" />
              </div>
              <button
                onClick={() => setConfirmCancel(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <h3
                className="text-lg font-semibold text-neutral-800 mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Cancelar agendamento?
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Esta ação não pode ser desfeita. O agendamento ficará com
                status <strong>Cancelado</strong>.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmCancel(null)}
                className="flex-1 py-3 rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={() => handleCancel(confirmCancel)}
                disabled={!!cancellingId}
                className="flex-1 py-3 rounded-full text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#E53E3E" }}
              >
                {cancellingId ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Confirmar cancelamento"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
