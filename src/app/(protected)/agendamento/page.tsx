"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  CalendarDays,
  Calendar as CalendarIcon,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const ACCENT = "#C49A82";
const ACCENT_LIGHT = "#F5EDE6";

const DEFAULT_TIME_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:15", "11:30", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Service {
  id: string;
  nome: string;
  descricao: string;
  duracao_minutos: number;
  preco: number;
  ativo: boolean;
}

interface Config {
  hora_abertura: string;
  hora_fechamento: string;
  almoco_inicio: string;
  almoco_fim: string;
  dias_funcionamento: number[];
  telefone?: string;
  logo_url?: string;
  nome_site?: string;
  site_url?: string;
}

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [agendaBlocks, setAgendaBlocks] = useState<any[]>([]);

  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cells = buildCalendar(calYear, calMonth);

  useEffect(() => {
    const fetchInitialData = async () => {
      setPageLoading(true);
      setErrorMsg(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserProfile({
            nome: session.user.user_metadata?.full_name || "Usuário",
            foto_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
            role: "paciente",
          });
        } else {
          const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              setUserProfile({
                nome: data.data.nome,
                foto_url: data.data.foto_url || "",
                role: "profissional",
              });
            }
          }
        }

        const resServices = await fetch("/api/servicos?ativo=true");
        if (!resServices.ok) throw new Error("Erro ao carregar serviços");
        const servicesData = await resServices.json();
        setServices(servicesData);
        if (servicesData.length > 0) {
          const queryParams = new URLSearchParams(window.location.search);
          const queryServiceId = queryParams.get("servico");
          const found = servicesData.find((s: any) => s.id === queryServiceId);
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
  }, []);

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
          setActiveBookings(bookingsData.filter((b: any) => b.status !== "CANCELADO"));
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const prevMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };

  const nextMonth = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const isPast = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
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

  const getLocalDateTimeString = (year: number, month: number, day: number, time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date(year, month, day, parseInt(hours), parseInt(minutes));
    const pad = (num: number) => String(num).padStart(2, "0");
    const tzo = -date.getTimezoneOffset();
    const dif = tzo >= 0 ? "+" : "-";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${dif}${pad(Math.floor(Math.abs(tzo) / 60))}:${pad(Math.abs(tzo) % 60)}`;
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

    const slotStartStr = getLocalDateTimeString(calYear, calMonth, selectedDay, time);
    const slotStart = new Date(slotStartStr);
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);
    const doesOverlap = (sS: Date, sE: Date, rS: Date, rE: Date) => sS < rE && sE > rS;

    if (activeBookings.some((b: any) => doesOverlap(slotStart, slotEnd, new Date(b.inicio), new Date(b.fim)))) return true;
    if (agendaBlocks.some((bl: any) => doesOverlap(slotStart, slotEnd, new Date(bl.inicio), new Date(bl.fim)))) return true;

    return false;
  };

  const handleAdvance = () => {
    if (!selectedService || !selectedDay || !selectedTime) return;

    const inicioStr = getLocalDateTimeString(calYear, calMonth, selectedDay, selectedTime);
    const inicio = new Date(inicioStr);
    const fimStr = new Date(inicio.getTime() + selectedService.duracao_minutos * 60 * 1000).toISOString();

    localStorage.setItem("selected_service_id", selectedService.id);
    localStorage.setItem("selected_service_name", selectedService.nome);
    localStorage.setItem("selected_service_price", String(selectedService.preco));
    localStorage.setItem("selected_date_display", `Dia ${selectedDay} de ${MONTH_NAMES[calMonth]} de ${calYear}`);
    localStorage.setItem("selected_time_display", selectedTime);
    localStorage.setItem("selected_inicio", inicioStr);
    localStorage.setItem("selected_fim", fimStr);

    router.push("/confirmacao");
  };

  const handleSignOut = async () => {
    if (userProfile?.role === "profissional") {
      await fetch("/api/profissionais/auth", { method: "DELETE" });
      window.location.href = "/profissional/login";
    } else {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

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
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-4">
            <button
              id="btn-back"
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors group cursor-pointer"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            <div className="w-px h-5 bg-neutral-200" />

            <div className="flex items-center gap-2.5">
              <img
                src={config?.logo_url || "/logo.png"}
                alt="Logo"
                className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-neutral-200 shrink-0"
              />
              <span
                className="text-[15px] text-neutral-900 hidden sm:block"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                {config?.nome_site || siteConfig.name}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
            <span>Serviços</span>
            <ChevronRight size={11} className="opacity-40" />
            <span className="text-neutral-800 font-semibold">Data &amp; Hora</span>
            <ChevronRight size={11} className="opacity-40" />
            <span>Confirmação</span>
          </div>

          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              id="btn-avatar-menu"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center rounded-full cursor-pointer focus:outline-none group relative"
              aria-label="Menu do usuário"
            >
              {userProfile?.foto_url ? (
                <img
                  src={userProfile.foto_url}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-[#C49A82]/20 group-hover:ring-[#C49A82]/50 transition-all"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm ring-2 ring-[#C49A82]/20 group-hover:ring-[#C49A82]/50 transition-all"
                  style={{ background: ACCENT }}
                >
                  {userProfile?.nome ? userProfile.nome.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white transition-colors ${dropdownOpen ? "bg-[#C49A82]" : "bg-emerald-400"}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden z-50" style={{ animation: "fadeIn .15s ease" }}>
                <div className="px-4 py-3 border-b border-neutral-50">
                  <p className="text-xs text-neutral-400 mb-0.5">Logado como</p>
                  <p className="text-sm font-semibold text-neutral-800 truncate">{userProfile?.nome || "Usuário"}</p>
                </div>
                <div className="py-1.5">
                  {userProfile?.role === "profissional" && (
                    <button
                      id="dropdown-voltar-painel"
                      onClick={() => { setDropdownOpen(false); router.push("/painel"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer text-amber-800"
                    >
                      <Sparkles size={15} className="text-amber-600" />
                      Painel Administrativo
                    </button>
                  )}
                  <button
                    id="dropdown-minha-conta"
                    onClick={() => { setDropdownOpen(false); router.push("/minha-conta"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <User size={15} className="text-neutral-400" />
                    Minha Conta
                  </button>
                  <button
                    id="dropdown-meus-agendamentos"
                    onClick={() => { setDropdownOpen(false); router.push("/meus-agendamentos"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer"
                    style={{ color: ACCENT }}
                  >
                    <CalendarDays size={15} style={{ color: ACCENT }} />
                    Meus Agendamentos
                  </button>
                  <button
                    id="dropdown-sair"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
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
                if (s) { setSelectedService(s); setSelectedTime(null); }
              }}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <h2
                className="text-xl text-[#2B2723]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                {selectedService.nome}
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {selectedService.descricao || "Nenhuma descrição fornecida."}
              </p>
              <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Clock size={13} />
                  <span className="text-xs">{selectedService.duracao_minutos} min</span>
                </div>
                <span
                  className="text-2xl font-light ml-auto"
                  style={{ fontFamily: "'Playfair Display', serif", color: ACCENT }}
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
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              <CalendarIcon size={18} className="text-[#C49A82]" />
              <span>{MONTH_NAMES[calMonth]} {calYear}</span>
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
              <div key={d} className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 py-1 font-semibold">
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
                    onClick={() => { setSelectedDay(day); setSelectedTime(null); }}
                    className={`w-9 h-9 rounded-full text-sm transition-all duration-150 cursor-pointer flex items-center justify-center ${
                      disabled ? "opacity-25 cursor-not-allowed text-neutral-400" : "text-neutral-800"
                    }`}
                    style={selected ? { background: ACCENT, color: "#FFFFFF", fontWeight: 600 } : {}}
                    onMouseEnter={(e) => {
                      if (!selected && !disabled) (e.currentTarget as HTMLButtonElement).style.background = ACCENT_LIGHT;
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
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
              <div className="border-t border-neutral-100" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-4 font-semibold">
                  Horários Disponíveis {slotsLoading && " (Verificando...)"}
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
                            disabled ? "opacity-30 border-neutral-100 text-neutral-350 cursor-not-allowed line-through" : ""
                          }`}
                          style={
                            active
                              ? { background: ACCENT, color: "#FFFFFF", borderColor: ACCENT }
                              : !disabled
                              ? { background: "transparent", color: "var(--muted-foreground)", borderColor: "var(--border)" }
                              : {}
                          }
                          onMouseEnter={(e) => {
                            if (!active && !disabled) {
                              const el = e.currentTarget as HTMLButtonElement;
                              el.style.background = ACCENT_LIGHT;
                              el.style.borderColor = ACCENT;
                              el.style.color = ACCENT;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active && !disabled) {
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
                  Dia {selectedDay} de {MONTH_NAMES[calMonth]} — {selectedTime}
                </p>
                <p className="text-xs text-neutral-500">{selectedService.nome}</p>
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
