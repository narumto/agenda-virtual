"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Scissors,
  CalendarDays,
  Banknote,
  CheckCircle2,
} from "lucide-react";

const ACCENT = "#C49A82";
const ACCENT_LIGHT = "#F5EDE6";

const summaryItems = [
  {
    icon: Scissors,
    label: "Serviço",
    value: "Design de Sobrancelhas",
  },
  {
    icon: CalendarDays,
    label: "Data e Hora",
    value: "15 de Julho de 2026 às 10:00",
  },
  {
    icon: Banknote,
    label: "Valor Total",
    value: "80€",
    highlight: true,
  },
];

export default function ConfirmacaoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "E-mail inválido";
    if (!form.phone.trim()) e.phone = "Telefone obrigatório";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Header onBack={() => router.push("/agendamento")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: ACCENT_LIGHT }}
          >
            <CheckCircle2 size={32} style={{ color: ACCENT }} />
          </div>
          <h1
            className="text-3xl text-foreground mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Agendamento Confirmado!
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Até breve,{" "}
            <span className="text-foreground font-medium">
              {form.name.split(" ")[0]}
            </span>
            !
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card shadow-sm px-8 py-5 text-sm text-muted-foreground space-y-1">
            <p>
              <span className="text-foreground font-medium">
                Design de Sobrancelhas
              </span>
            </p>
            <p>15 de Julho de 2026 às 10:00</p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", phone: "", notes: "" });
            }}
            className="mt-8 text-sm font-medium transition-colors"
            style={{ color: ACCENT }}
          >
            ← Fazer novo agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Header onBack={() => router.push("/agendamento")} />

      {/* Page title */}
      <div className="text-center pt-10 pb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Etapa 3 de 3
        </p>
        <h1
          className="text-3xl text-foreground"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Confirme o seu Agendamento
        </h1>
      </div>

      {/* Two-column layout */}
      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">

        {/* ── Left: Resumo ── */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Card header strip */}
          <div
            className="px-6 py-4 border-b border-border"
            style={{ background: ACCENT_LIGHT }}
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
              Resumo do Agendamento
            </p>
            <p
              className="text-lg text-foreground"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              Design de Sobrancelhas
            </p>
          </div>

          {/* Summary list */}
          <div className="divide-y divide-border">
            {summaryItems.map(({ icon: Icon, label, value, highlight }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: ACCENT_LIGHT }}
                >
                  <Icon size={14} style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wide">
                    {label}
                  </p>
                  <p
                    className="text-sm font-medium truncate"
                    style={
                      highlight
                        ? {
                            color: ACCENT,
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.1rem",
                          }
                        : { color: "var(--foreground)" }
                    }
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Ao confirmar, concorda com a nossa{" "}
              <button
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                style={{ color: ACCENT }}
              >
                política de cancelamento
              </button>
              . Cancelamentos com menos de 24h podem ter custo.
            </p>
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-7">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">
            Seus Dados
          </p>
          <h2
            className="text-xl text-foreground mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Preencha seus dados para finalizar
          </h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Nome */}
            <Field
              label="Nome Completo"
              type="text"
              placeholder="Ex: Sofia Mendes"
              value={form.name}
              error={errors.name}
              onChange={(v) => set("name", v)}
            />

            {/* Email + Telefone side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="E-mail"
                type="email"
                placeholder="sofia@email.com"
                value={form.email}
                error={errors.email}
                onChange={(v) => set("email", v)}
              />
              <Field
                label="Telefone (WhatsApp)"
                type="tel"
                placeholder="+351 912 345 678"
                value={form.phone}
                error={errors.phone}
                onChange={(v) => set("phone", v)}
              />
            </div>

            {/* Observações */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium text-foreground"
                style={{ letterSpacing: "0.02em" }}
              >
                Observações{" "}
                <span className="text-muted-foreground font-normal">
                  (Opcional)
                </span>
              </label>
              <textarea
                placeholder="Alguma informação adicional que devamos saber? Ex: alergia a produtos específicos..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none transition-colors focus:outline-none"
                style={{ lineHeight: "1.6" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ background: ACCENT, letterSpacing: "0.03em" }}
              >
                Confirmar Agendamento
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-6 px-10 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Voltar</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="opacity-40 line-through">Serviços</span>
          <ChevronRight size={12} className="opacity-40" />
          <span className="opacity-40 line-through">Data &amp; Hora</span>
          <ChevronRight size={12} className="opacity-40" />
          <span
            className="text-foreground font-medium"
            style={{ color: ACCENT }}
          >
            Confirmação
          </span>
        </div>

        <div className="flex items-center gap-2 mx-auto">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: ACCENT }}
          >
            <Sparkles size={13} className="text-white" />
          </div>
          <span
            className="text-[15px] tracking-wide text-foreground"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
          >
            Agenda Virtual
          </span>
        </div>

        <div className="w-[72px]" />
      </div>
    </header>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  error,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-medium text-foreground"
        style={{ letterSpacing: "0.02em" }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border bg-background text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none"
        style={{ borderColor: error ? "#C0392B" : "var(--border)" }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = ACCENT;
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--border)";
        }}
      />
      {error && (
        <p className="text-[11px]" style={{ color: "#C0392B" }}>
          {error}
        </p>
      )}
    </div>
  );
}
