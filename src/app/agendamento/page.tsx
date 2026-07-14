"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

const ACCENT = "#C49A82";
const ACCENT_LIGHT = "#F5EDE6";



const timeSlots = ["09:00", "09:30", "10:00", "14:00", "15:30", "16:00"];

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function AgendamentoPage() {
  const router = useRouter();
  const today = new Date();

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const cells = buildCalendar(calYear, calMonth);

  const prevMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const isPast = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const handleAdvance = () => {
    router.push("/confirmacao");
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-6 px-10 py-4">
          <button
            id="btn-back"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Voltar</span>
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="line-through opacity-50">Serviços</span>
            <ChevronRight size={12} className="opacity-40" />
            <span className="text-foreground font-medium">Data &amp; Hora</span>
            <ChevronRight size={12} className="opacity-40" />
            <span className="opacity-50">Confirmação</span>
          </div>

          {/* Logo */}
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

      {/* Page title */}
      <div className="text-center pt-10 pb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Etapa 2 de 3
        </p>
        <h1
          className="text-3xl text-foreground"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Escolha a Data e Hora
        </h1>
      </div>

      {/* Main layout */}
      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">

        {/* Left column */}
        <div className="flex flex-col gap-5">

          {/* Service summary */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: ACCENT }}
            />
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
              Serviço selecionado
            </p>
            <h2
              className="text-xl text-foreground mb-3"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              Design de Sobrancelhas
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Modelagem personalizada para valorizar o formato natural
            </p>
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={13} />
                <span className="text-xs">30 min</span>
              </div>
              <span
                className="text-2xl font-light ml-auto"
                style={{ fontFamily: "'Playfair Display', serif", color: ACCENT }}
              >
                R$ 80
              </span>
            </div>
          </div>


        </div>

        {/* Right column */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col gap-6">

          {/* Calendar header */}
          <div className="flex items-center justify-between">
            <h3
              className="text-lg text-foreground"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              {MONTH_NAMES[calMonth]} {calYear}
            </h3>
            <div className="flex items-center gap-1">
              <button
                id="btn-prev-month"
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                id="btn-next-month"
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1 -mt-3">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const selected = selectedDay === day;
              const past = isPast(day);
              return (
                <div key={i} className="flex items-center justify-center py-0.5">
                  <button
                    id={`day-${day}`}
                    disabled={past}
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedTime(null);
                    }}
                    className="w-9 h-9 rounded-full text-sm transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={
                      selected
                        ? { background: ACCENT, color: "#FFFFFF", fontWeight: 600 }
                        : { color: "var(--foreground)", background: "transparent" }
                    }
                    onMouseEnter={(e) => {
                      if (!selected && !past)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          ACCENT_LIGHT;
                    }}
                    onMouseLeave={(e) => {
                      if (!selected)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                    }}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          {selectedDay !== null && (
            <>
              <div className="border-t border-border" />

              {/* Time slots */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
                  Horários Disponíveis
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {timeSlots.map((slot) => {
                    const active = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        id={`slot-${slot.replace(":", "")}`}
                        onClick={() => setSelectedTime(slot)}
                        className="py-2.5 rounded-full text-sm font-medium border transition-all duration-150 active:scale-95"
                        style={
                          active
                            ? {
                                background: ACCENT,
                                color: "#FFFFFF",
                                borderColor: ACCENT,
                              }
                            : {
                                background: "transparent",
                                color: "var(--muted-foreground)",
                                borderColor: "var(--border)",
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!active) {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = ACCENT_LIGHT;
                            el.style.borderColor = ACCENT;
                            el.style.color = ACCENT;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "transparent";
                            el.style.borderColor = "var(--border)";
                            el.style.color = "var(--muted-foreground)";
                          }
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Summary + Advance */}
          {selectedDay && selectedTime && (
            <div className="flex items-end justify-between pt-2 border-t border-border mt-auto animate-in fade-in duration-300">
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">
                  Agendamento selecionado
                </p>
                <p className="text-sm font-medium text-foreground">
                  Dia {selectedDay} de {MONTH_NAMES[calMonth]} — {selectedTime}
                </p>
              </div>

              <button
                id="btn-advance"
                onClick={handleAdvance}
                className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 text-white"
                style={{
                  background: ACCENT,
                  letterSpacing: "0.02em",
                }}
              >
                Avançar
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
