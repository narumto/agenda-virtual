"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { ACCENT, ACCENT_LIGHT } from "@/config/constants";
import type { Service, AppConfig } from "@/types";
import Holidays from "date-holidays";

const hd = new Holidays("PT");

const getHolidayName = (year: number, month: number, day: number): string | null => {
  const d = new Date(year, month, day);
  const holiday = hd.isHoliday(d) as any;
  if (holiday) {
    if (Array.isArray(holiday)) {
      return holiday[0].name;
    }
    return holiday.name;
  }
  return null;
};

const getLisbonToday = () => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(new Date());
  const p: Record<string, string> = {};
  parts.forEach(part => { p[part.type] = part.value; });
  return new Date(parseInt(p.year), parseInt(p.month) - 1, parseInt(p.day));
};

const DEFAULT_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:15", "11:30", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];
const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
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

function getLocalDateTimeString(
  year: number,
  month: number,
  day: number,
  time: string,
) {
  const [hours, minutes] = time.split(":").map(Number);
  
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Lisbon",
    timeZoneName: "longOffset"
  });
  const date = new Date(Date.UTC(year, month, day, hours, minutes));
  const parts = formatter.formatToParts(date);
  const tzNamePart = parts.find(p => p.type === "timeZoneName");
  
  let offset = "+00:00";
  if (tzNamePart && tzNamePart.value !== "GMT") {
    const match = tzNamePart.value.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (match) {
      const sign = match[1];
      const h = match[2].padStart(2, "0");
      const m = (match[3] || "00").padStart(2, "0");
      offset = `${sign}${h}:${m}`;
    }
  }
  
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00${offset}`;
}

// Inner component that uses useSearchParams (needs Suspense boundary)
function AgendamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile, signOut } = useAuth();
  const today = getLisbonToday();

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [agendaBlocks, setAgendaBlocks] = useState<any[]>([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cells = buildCalendar(calYear, calMonth);

  useEffect(() => {
    const fetchInitialData = async () => {
      setPageLoading(true);
      setErrorMsg(null);
      try {
        const resServices = await fetch("/api/servicos?ativo=true");
        if (!resServices.ok) throw new Error("Erro ao carregar serviços");
        const servicesData = await resServices.json();
        setServices(servicesData);
        if (servicesData.length > 0) {
          const queryServiceId = searchParams.get("servico");
          const found = servicesData.find(
            (s: Service) => s.id === queryServiceId,
          );
          setSelectedService(found || servicesData[0]);
        }

        const resConfig = await fetch("/api/configuracoes");
        if (!resConfig.ok) throw new Error("Erro ao carregar configurações");
        const configData = await resConfig.json();
        setConfig(configData);
      } catch (err: any) {
        setErrorMsg(err.message || "Erro de conexão com o servidor.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchInitialData();
  }, [searchParams]);

  useEffect(() => {
    if (selectedDay === null) {
      setActiveBookings([]);
      setAgendaBlocks([]);
      return;
    }

    const fetchAvailabilityData = async () => {
      setSlotsLoading(true);
      try {
        const resBookings = await fetch(`/api/agendamentos`);
        if (resBookings.ok) {
          const bookingsData = await resBookings.json();
          setActiveBookings(
            bookingsData.filter((b: any) => b.status !== "CANCELADO"),
          );
        }

        const resBlocks = await fetch(`/api/bloqueios-agenda`);
        if (resBlocks.ok) {
          const blocksData = await resBlocks.json();
          setAgendaBlocks(blocksData);
        }
      } catch {
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailabilityData();
  }, [selectedDay, calYear, calMonth]);

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
    return d < today;
  };

  const isDayDisabled = (day: number) => {
    if (isPast(day)) return true;

    const holidayName = getHolidayName(calYear, calMonth, day);
    if (holidayName !== null) {
      const dayStart = new Date(calYear, calMonth, day, 0, 0, 0);
      const dayEnd = new Date(calYear, calMonth, day, 23, 59, 59);
      const isUnblocked = agendaBlocks.some((block: any) => {
        if (block.motivo !== "DESBLOQUEIO_FERIADO") return false;
        const blockStart = new Date(block.inicio);
        const blockEnd = new Date(block.fim);
        const overlapStart = new Date(Math.max(dayStart.getTime(), blockStart.getTime()));
        const overlapEnd = new Date(Math.min(dayEnd.getTime(), blockEnd.getTime()));
        return overlapStart < overlapEnd;
      });
      if (!isUnblocked) return true;
    }

    const d = new Date(calYear, calMonth, day);
    if (!config?.dias_funcionamento || !config.dias_funcionamento.includes(d.getDay())) return true;

    const dayStart = new Date(calYear, calMonth, day, 0, 0, 0);
    const dayEnd = new Date(calYear, calMonth, day, 23, 59, 59);
    const hasFullDayBlock = agendaBlocks.some((block: any) => {
      if (block.motivo === "DESBLOQUEIO_FERIADO") return false;
      const blockStart = new Date(block.inicio);
      const blockEnd = new Date(block.fim);

      const overlapStart = new Date(Math.max(dayStart.getTime(), blockStart.getTime()));
      const overlapEnd = new Date(Math.min(dayEnd.getTime(), blockEnd.getTime()));
      if (overlapStart < overlapEnd) {
        const overlapDurationMs = overlapEnd.getTime() - overlapStart.getTime();
        return overlapDurationMs >= 12 * 60 * 60 * 1000;
      }
      return false;
    });

    return hasFullDayBlock;
  };

  const isSlotDisabled = (time: string) => {
    if (!selectedDay || !config || !selectedService) return true;

    const [hours, minutes] = time.split(":").map(Number);
    const slotDuration = selectedService.duracao_minutos;
    const slotMinutes = hours * 60 + minutes;
    const endSlotMinutes = slotMinutes + slotDuration;

    const [openH, openM] = config.hora_abertura.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const [closeH, closeM] = config.hora_fechamento.split(":").map(Number);
    const closeMinutes = closeH * 60 + closeM;

    if (slotMinutes < openMinutes || endSlotMinutes > closeMinutes) return true;

    if (config.almoco_inicio && config.almoco_fim) {
      const [lsH, lsM] = config.almoco_inicio.split(":").map(Number);
      const lunchStart = lsH * 60 + lsM;
      const [leH, leM] = config.almoco_fim.split(":").map(Number);
      const lunchEnd = leH * 60 + leM;
      if (slotMinutes < lunchEnd && endSlotMinutes > lunchStart) return true;
    }

    const slotStartStr = getLocalDateTimeString(
      calYear,
      calMonth,
      selectedDay,
      time,
    );
    const slotStart = new Date(slotStartStr);
    
    // Bloquear horários passados
    if (slotStart < new Date()) return true;

    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);
    const doesOverlap = (sS: Date, sE: Date, rS: Date, rE: Date) =>
      sS < rE && sE > rS;

    if (
      activeBookings.some((b: any) =>
        doesOverlap(slotStart, slotEnd, new Date(b.inicio), new Date(b.fim)),
      )
    )
      return true;
    if (
      agendaBlocks.some((bl: any) =>
        doesOverlap(slotStart, slotEnd, new Date(bl.inicio), new Date(bl.fim)),
      )
    )
      return true;

    return false;
  };

  const handleAdvance = () => {
    if (!selectedService || !selectedDay || !selectedTime) return;

    const inicioStr = getLocalDateTimeString(
      calYear,
      calMonth,
      selectedDay,
      selectedTime,
    );
    const inicio = new Date(inicioStr);
    const endOffsetTime = new Date(inicio.getTime() + selectedService.duracao_minutos * 60 * 1000);
    const endFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false
    });
    const endParts = endFormatter.formatToParts(endOffsetTime);
    const p: Record<string, string> = {};
    endParts.forEach(part => { p[part.type] = part.value; });
    const endHours = p.hour === "24" ? "00" : p.hour.padStart(2, "0");
    const endMinutes = p.minute.padStart(2, "0");
    
    const fimStr = getLocalDateTimeString(
      parseInt(p.year),
      parseInt(p.month) - 1,
      parseInt(p.day),
      `${endHours}:${endMinutes}`
    );

    const params = new URLSearchParams({
      servico_id: selectedService.id,
      servico_nome: selectedService.nome,
      servico_preco: String(selectedService.preco),
      data: `Dia ${selectedDay} de ${MONTH_NAMES[calMonth]} de ${calYear}`,
      hora: selectedTime,
      inicio: inicioStr,
      fim: fimStr,
    });

    router.push(`/confirmacao?${params.toString()}`);
  };

  const BREADCRUMBS = [
    { label: "Serviços" },
    { label: "Data & Hora", active: true },
    { label: "Confirmação" },
  ];

  if (pageLoading) {
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
        backLabel="Voltar"
        breadcrumbs={BREADCRUMBS}
      />

      {errorMsg && (
        <div className="max-w-md mx-auto mt-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-center text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="text-center pt-10 pb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#C49A82] font-semibold mb-2">
          Etapa 2 de 3
        </p>
        <h1
          className="text-3xl text-[#2B2723]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
          }}
        >
          Escolha a Data e Hora
        </h1>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm relative overflow-hidden space-y-4">
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: ACCENT }}
          />

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 block mb-2 font-semibold">
              Serviço selecionado
            </label>
            <select
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#C49A82]/20 cursor-pointer"
              value={selectedService?.id || ""}
              onChange={(e) => {
                const s = services.find((serv) => serv.id === e.target.value);
                if (s) {
                  setSelectedService(s);
                  setSelectedTime(null);
                }
              }}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <h2
                className="text-xl text-[#2B2723]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 500,
                }}
              >
                {selectedService.nome}
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {selectedService.descricao ||
                  "Nenhuma descrição fornecida."}
              </p>
              <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Clock size={13} />
                  <span className="text-xs">
                    {selectedService.duracao_minutos} min
                  </span>
                </div>
                <span
                  className="text-2xl font-light ml-auto"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: ACCENT,
                  }}
                >
                  € {selectedService.preco}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-neutral-200/60 bg-white shadow-sm p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3
              className="text-lg text-[#2B2723] flex items-center gap-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 500,
              }}
            >
              <CalendarIcon size={18} className="text-[#C49A82]" />
              <span>
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
            </h3>
            <div className="flex items-center gap-1">
              <button
                id="btn-prev-month"
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                id="btn-next-month"
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center border-b border-neutral-100 pb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 py-1 font-semibold"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1.5 -mt-3">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const selected = selectedDay === day;
              const disabled = isDayDisabled(day);
              return (
                <div key={i} className="flex items-center justify-center py-0.5">
                  <button
                    id={`day-${day}`}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedTime(null);
                    }}
                    className={`w-9 h-9 rounded-full text-sm transition-all duration-150 cursor-pointer flex items-center justify-center ${
                      disabled
                        ? "opacity-25 cursor-not-allowed text-neutral-400"
                        : "text-neutral-800 hover:bg-[#F5EDE6]"
                    }`}
                    style={
                      selected
                        ? {
                            background: ACCENT,
                            color: "#FFFFFF",
                            fontWeight: 600,
                          }
                        : {}
                    }
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          {selectedDay !== null && (
            <>
              <div className="border-t border-neutral-100" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-4 font-semibold">
                  Horários Disponíveis{" "}
                  {slotsLoading && " (Verificando...)"}
                </p>

                {slotsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
                    {DEFAULT_TIME_SLOTS.map((slot) => {
                      const disabled = isSlotDisabled(slot);
                      const active = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          id={`slot-${slot.replace(":", "")}`}
                          disabled={disabled}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 rounded-full text-sm font-medium border transition-all duration-150 active:scale-95 cursor-pointer text-center ${
                            disabled
                              ? "opacity-30 border-neutral-100 text-neutral-350 cursor-not-allowed line-through"
                              : active
                                ? "text-white"
                                : "text-muted-foreground border-border hover:bg-[#F5EDE6] hover:border-[#C49A82] hover:text-[#C49A82]"
                          }`}
                          style={
                            active
                              ? {
                                  background: ACCENT,
                                  color: "#FFFFFF",
                                  borderColor: ACCENT,
                                }
                              : {}
                          }
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {selectedDay && selectedTime && selectedService && (
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between pt-4 border-t border-neutral-100 gap-4 mt-auto">
              <div>
                <p className="text-[11px] text-neutral-400 mb-0.5 uppercase tracking-wide font-semibold">
                  Agendamento selecionado
                </p>
                <p className="text-sm font-semibold text-neutral-800">
                  Dia {selectedDay} de {MONTH_NAMES[calMonth]} —{" "}
                  {selectedTime}
                </p>
                <p className="text-xs text-neutral-500">
                  {selectedService.nome}
                </p>
              </div>

              <button
                id="btn-advance"
                onClick={handleAdvance}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 text-white shadow-sm hover:shadow-md cursor-pointer ml-auto w-full sm:w-auto justify-center"
                style={{ background: ACCENT, letterSpacing: "0.02em" }}
              >
                <span>Avançar</span>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Page component with Suspense boundary for useSearchParams
export default function AgendamentoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
          <div className="w-8 h-8 border-4 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AgendamentoContent />
    </Suspense>
  );
}
