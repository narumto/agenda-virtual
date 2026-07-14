"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CalendarDays,
  Scissors,
  Users,
  Settings,
  LogOut,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Phone,
  CheckCircle,
  AlertCircle,
  CircleDot,
  Lock,
  Edit,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const ACCENT = "#C49A82";
const ACCENT_LIGHT = "#F5EDE6";
const SIDEBAR_BG = "#1E1B18";
const SIDEBAR_TEXT = "#C8BFB8";
const SIDEBAR_ACTIVE_BG = "#2D2722";

type Status = "confirmed" | "pending" | "done" | "blocked";

interface Appointment {
  id: number;
  time: string;
  end: string;
  client: string;
  phone?: string;
  service: string;
  professional: string;
  proInitials: string;
  proColor: string;
  status: Status;
  blocked?: boolean;
  blockedLabel?: string;
}

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  image: string;
  category: "rosto" | "corpo";
}

const DEFAULT_SERVICES: Service[] = [
  {
    id: "r1",
    name: "Limpeza de Pele Profunda",
    duration: "90 min",
    price: "R$ 180",
    description:
      "Remoção de impurezas, cravos e células mortas, devolvendo o viço e a saúde da pele.",
    image:
      "https://images.unsplash.com/photo-1761718209708-9ab9ba1c7252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "rosto",
  },
  {
    id: "r2",
    name: "Peeling de Diamante",
    duration: "45 min",
    price: "R$ 120",
    description:
      "Microesfoliação que auxilia na renovação celular e redução de manchas leves.",
    image:
      "https://images.unsplash.com/photo-1767360963892-3353defd6584?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "rosto",
  },
  {
    id: "r3",
    name: "Revitalização Facial",
    duration: "60 min",
    price: "R$ 150",
    description:
      "Nutrição intensiva com ativos antioxidantes para uma pele luminosa e hidratada.",
    image:
      "https://images.unsplash.com/photo-1778330804164-2f6d5d3b16ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw8fHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "rosto",
  },
  {
    id: "c1",
    name: "Drenagem Linfática",
    duration: "60 min",
    price: "R$ 140",
    description:
      "Reduz o inchaço e melhora a circulação através de manobras suaves e rítmicas.",
    image:
      "https://images.unsplash.com/photo-1761819921158-c3fa28f39bf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "corpo",
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    time: "09:00",
    end: "09:30",
    client: "Beatriz Costa",
    phone: "+55 11 91234-5678",
    service: "Design de Sobrancelhas",
    professional: "Ana Silva",
    proInitials: "AS",
    proColor: "#C49A82",
    status: "done",
  },
  {
    id: 2,
    time: "09:30",
    end: "10:10",
    client: "Laura Ferreira",
    phone: "+55 11 92345-6789",
    service: "Hydra Gloss",
    professional: "Maria Souza",
    proInitials: "MS",
    proColor: "#B08898",
    status: "done",
  },
  {
    id: 3,
    time: "10:00",
    end: "10:30",
    client: "Sofia Mendes",
    phone: "+55 11 93456-7890",
    service: "Design de Sobrancelhas",
    professional: "Ana Silva",
    proInitials: "AS",
    proColor: "#C49A82",
    status: "confirmed",
  },
  {
    id: 4,
    time: "11:00",
    end: "12:00",
    client: "Inês Rodrigues",
    phone: "+55 11 94567-8901",
    service: "Limpeza de Pele",
    professional: "Maria Souza",
    proInitials: "MS",
    proColor: "#B08898",
    status: "confirmed",
  },
  {
    id: 5,
    time: "12:00",
    end: "13:00",
    client: "",
    service: "",
    professional: "",
    proInitials: "",
    proColor: "",
    status: "blocked",
    blocked: true,
    blockedLabel: "Pausa para Almoço",
  },
  {
    id: 6,
    time: "14:00",
    end: "14:30",
    client: "Mariana Lopes",
    phone: "+55 11 95678-9012",
    service: "Design de Sobrancelhas",
    professional: "Ana Silva",
    proInitials: "AS",
    proColor: "#C49A82",
    status: "pending",
  },
  {
    id: 7,
    time: "15:00",
    end: "16:00",
    client: "Catarina Alves",
    phone: "+55 11 96789-0123",
    service: "Peeling de Hollywood",
    professional: "Maria Souza",
    proInitials: "MS",
    proColor: "#B08898",
    status: "pending",
  },
  {
    id: 8,
    time: "16:30",
    end: "17:00",
    client: "Rita Nunes",
    phone: "+55 11 97890-1234",
    service: "Design de Sobrancelhas",
    professional: "Ana Silva",
    proInitials: "AS",
    proColor: "#C49A82",
    status: "confirmed",
  },
];

const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; dot: string; icon: React.FC<{ size: number }> }> = {
  confirmed: {
    label: "Confirmado",
    bg: "#EAFAF1",
    text: "#1E8449",
    dot: "#27AE60",
    icon: CheckCircle,
  },
  pending: {
    label: "Pendente",
    bg: "#FEF9E7",
    text: "#B7770D",
    dot: "#F39C12",
    icon: AlertCircle,
  },
  done: {
    label: "Concluído",
    bg: "#F4F4F4",
    text: "#7D7D7D",
    dot: "#ADADAD",
    icon: CircleDot,
  },
  blocked: {
    label: "Bloqueado",
    bg: "#F0EDE9",
    text: "#7A6F68",
    dot: "#A89990",
    icon: Lock,
  },
};

const navItems = [
  { id: "agenda", label: "Agenda do Dia", icon: CalendarDays },
  { id: "services", label: "Serviços", icon: Scissors },
  { id: "professionals", label: "Profissionais", icon: Users },
  { id: "settings", label: "Configurações", icon: Settings },
];

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEK_DAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

function buildMiniCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function PainelPage() {
  const router = useRouter();
  const today = new Date();

  // Core navigation & data
  const [activeNav, setActiveNav] = useState("agenda");
  const [services, setServices] = useState<Service[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(INITIAL_APPOINTMENTS);

  // Month navigation states
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // Modal & Edit action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openAppointmentMenuId, setOpenAppointmentMenuId] = useState<number | null>(null);

  // Service form fields
  const [servName, setServName] = useState("");
  const [servCategory, setServCategory] = useState<"rosto" | "corpo">("rosto");
  const [servPrice, setServPrice] = useState("");
  const [servDuration, setServDuration] = useState("");
  const [servDescription, setServDescription] = useState("");
  const [servImage, setServImage] = useState("");

  // Settings states
  const [settingsForm, setSettingsForm] = useState({
    salonName: "Agenda Virtual Estética",
    phone: "+351 912 345 678",
    hours: "09:00 às 18:00",
    email: "contato@agendavirtual.com",
    requireApproval: true,
  });
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load services list
  useEffect(() => {
    const saved = localStorage.getItem("av_services");
    if (saved) {
      try {
        setServices(JSON.parse(saved));
      } catch (e) {
        setServices(DEFAULT_SERVICES);
      }
    } else {
      localStorage.setItem("av_services", JSON.stringify(DEFAULT_SERVICES));
      setServices(DEFAULT_SERVICES);
    }
  }, []);

  const cells = buildMiniCalendar(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  };

  const totalConfirmed = appointmentsList.filter((a) => a.status === "confirmed").length;
  const totalPending = appointmentsList.filter((a) => a.status === "pending").length;
  const totalDone = appointmentsList.filter((a) => a.status === "done").length;
  const totalClients = appointmentsList.filter((a) => !a.blocked).length;

  // Save changes helper
  const saveServicesToStorage = (updated: Service[]) => {
    setServices(updated);
    localStorage.setItem("av_services", JSON.stringify(updated));
  };

  // Open modal for editing
  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setServName(service.name);
    setServCategory(service.category);
    setServPrice(service.price);
    setServDuration(service.duration);
    setServDescription(service.description);
    setServImage(service.image);
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingService(null);
    setServName("");
    setServCategory("rosto");
    setServPrice("");
    setServDuration("");
    setServDescription("");
    setServImage("");
    setIsModalOpen(true);
  };

  // Delete service
  const handleDeleteService = (id: string) => {
    const confirmed = window.confirm("Deseja realmente excluir este serviço?");
    if (confirmed) {
      const updated = services.filter((s) => s.id !== id);
      saveServicesToStorage(updated);
      setOpenMenuId(null);
    }
  };

  // Submit Modal form
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servName.trim() || !servPrice.trim() || !servDuration.trim()) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    let updated: Service[];

    if (editingService) {
      updated = services.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              name: servName,
              category: servCategory,
              price: servPrice,
              duration: servDuration,
              description: servDescription,
              image: servImage,
            }
          : s
      );
    } else {
      const newService: Service = {
        id: `s-${Date.now()}`,
        name: servName,
        category: servCategory,
        price: servPrice,
        duration: servDuration,
        description: servDescription,
        image:
          servImage ||
          "https://images.unsplash.com/photo-1761718209708-9ab9ba1c7252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      };
      updated = [...services, newService];
    }

    saveServicesToStorage(updated);
    setIsModalOpen(false);
  };

  // Settings save handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Appointment status toggles
  const handleAppointmentStatus = (id: number, status: Status) => {
    const updated = appointmentsList.map((a) =>
      a.id === id ? { ...a, status } : a
    );
    setAppointmentsList(updated);
    setOpenAppointmentMenuId(null);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#F5F0EB" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-[220px] shrink-0 flex flex-col py-6 px-4 gap-2"
        style={{ background: SIDEBAR_BG }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-6 cursor-pointer" onClick={() => router.push("/")}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: ACCENT }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p
              className="text-sm leading-tight text-white font-medium"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Agenda Virtual
            </p>
            <p className="text-[9px] uppercase tracking-widest text-[#C8BFB8]/50">
              Admin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveNav(item.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left w-full cursor-pointer"
                style={
                  active
                    ? { background: SIDEBAR_ACTIVE_BG, color: ACCENT }
                    : { color: SIDEBAR_TEXT, background: "transparent" }
                }
              >
                <Icon size={16} />
                {item.label}
                {active && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: ACCENT }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-1 pt-4 border-t border-white/5">
          {/* User profile */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ background: ACCENT }}
            >
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Admin</p>
              <p className="text-[10px] text-white/40 truncate">
                Gerente
              </p>
            </div>
          </div>
          <button
            id="btn-logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left w-full text-[#C8BFB8] hover:bg-white/5 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center content */}
        <main className="flex-1 overflow-y-auto p-8">

          {/* Top Bar / Header */}
          <div className="flex items-center justify-between mb-8 border-b border-neutral-200/50 pb-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {MONTH_NAMES[today.getMonth()]} {today.getFullYear()}
              </p>
              <h1
                className="text-3xl text-foreground font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {activeNav === "agenda" && "Agenda do Dia"}
                {activeNav === "services" && "Nossos Serviços"}
                {activeNav === "professionals" && "Lista de Profissionais"}
                {activeNav === "settings" && "Configurações do Painel"}
              </h1>
            </div>

            {/* Header buttons */}
            {activeNav === "agenda" && (
              <button
                id="btn-new-appointment"
                onClick={() => router.push("/agendamento")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ background: ACCENT }}
              >
                <Plus size={15} />
                Novo Agendamento
              </button>
            )}

            {activeNav === "services" && (
              <button
                id="btn-new-service"
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ background: ACCENT }}
              >
                <Plus size={15} />
                Novo Serviço
              </button>
            )}
          </div>

          {/* ──── Tab Content ──── */}

          {/* 1. AGENDA TAB */}
          {activeNav === "agenda" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total de Clientes", value: totalClients, color: ACCENT },
                  { label: "Confirmados", value: totalConfirmed, color: "#27AE60" },
                  { label: "Pendentes", value: totalPending, color: "#F39C12" },
                  { label: "Concluídos", value: totalDone, color: "#ADADAD" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white border border-border p-5 shadow-sm"
                  >
                    <div
                      className="w-2 h-2 rounded-full mb-3"
                      style={{ background: stat.color }}
                    />
                    <p className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* List */}
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">
                    Agendamentos — {selectedDay} de {MONTH_NAMES[calMonth]}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {appointmentsList.length} registros
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {appointmentsList.map((appt) => {
                    const cfg = STATUS_CONFIG[appt.status];
                    const Icon = cfg.icon;

                    if (appt.blocked) {
                      return (
                        <div
                          key={appt.id}
                          className="flex items-center gap-4 px-6 py-4"
                          style={{ background: "#FAFAF8" }}
                        >
                          <div className="w-16 shrink-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              {appt.time}
                            </p>
                            <p className="text-[10px] text-muted-foreground opacity-60">
                              {appt.end}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Lock size={13} style={{ color: cfg.dot }} />
                            <p className="text-sm text-muted-foreground italic">
                              {appt.blockedLabel}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={appt.id}
                        id={`appt-${appt.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/35 transition-colors"
                      >
                        {/* Time */}
                        <div className="w-16 shrink-0">
                          <p className="text-sm font-semibold text-foreground">
                            {appt.time}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {appt.end}
                          </p>
                        </div>

                        {/* Pro initials */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                          style={{ background: appt.proColor }}
                        >
                          {appt.proInitials}
                        </div>

                        {/* Client & Service Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {appt.client}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground truncate">
                              {appt.service}
                            </p>
                            <span className="text-muted-foreground opacity-40">
                              ·
                            </span>
                            <p className="text-xs text-muted-foreground truncate">
                              {appt.professional}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                          style={{ background: cfg.bg, color: cfg.text }}
                        >
                          <Icon size={11} />
                          {cfg.label}
                        </div>

                        {/* Actions dropdown */}
                        <div className="flex items-center gap-1 shrink-0 relative">
                          {appt.phone && (
                            <a
                              href={`tel:${appt.phone}`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                            >
                              <Phone size={14} />
                            </a>
                          )}
                          <button
                            id={`menu-${appt.id}`}
                            onClick={() =>
                              setOpenAppointmentMenuId(
                                openAppointmentMenuId === appt.id ? null : appt.id
                              )
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                          {openAppointmentMenuId === appt.id && (
                            <div className="absolute right-0 top-9 z-10 bg-white border border-border rounded-xl shadow-lg py-1.5 min-w-[140px]">
                              {(["confirmed", "pending", "done"] as Status[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={() =>
                                    handleAppointmentStatus(appt.id, st)
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary/60 transition-colors capitalize"
                                >
                                  Marcar como {STATUS_CONFIG[st].label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* 2. SERVICES TAB */}
          {activeNav === "services" && (
            <div className="space-y-6">
              {services.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground">
                  <Scissors size={48} className="mx-auto text-neutral-300 mb-4" />
                  <p className="text-lg">Nenhum serviço cadastrado.</p>
                  <p className="text-sm mt-1">Crie um novo serviço no botão acima.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                          <th className="px-6 py-4">Serviço</th>
                          <th className="px-6 py-4">Categoria</th>
                          <th className="px-6 py-4">Duração</th>
                          <th className="px-6 py-4">Preço</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {services.map((service) => (
                          <tr key={service.id} className="hover:bg-neutral-50/50 transition-all">
                            {/* Name & Image */}
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-100 bg-neutral-100">
                                <ImageWithFallback
                                  src={service.image}
                                  alt={service.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-neutral-800 truncate">
                                  {service.name}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {service.description}
                                </p>
                              </div>
                            </td>

                            {/* Category badge */}
                            <td className="px-6 py-4">
                              <span
                                className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full`}
                                style={
                                  service.category === "rosto"
                                    ? { background: "#FAF3E0", color: "#B7770D" }
                                    : { background: "#E3F2FD", color: "#1976D2" }
                                }
                              >
                                {service.category}
                              </span>
                            </td>

                            {/* Duration */}
                            <td className="px-6 py-4 text-sm text-neutral-600">
                              <div className="flex items-center gap-1">
                                <Clock size={13} />
                                {service.duration}
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 text-sm font-semibold text-neutral-800">
                              {service.price}
                            </td>

                            {/* Actions Dropdown */}
                            <td className="px-6 py-4 text-right relative">
                              <button
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === service.id ? null : service.id
                                  )
                                }
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-800 transition-colors inline-block cursor-pointer"
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {openMenuId === service.id && (
                                <div className="absolute right-6 top-12 z-20 bg-white border border-border rounded-xl shadow-lg py-1.5 min-w-[130px] text-left">
                                  <button
                                    onClick={() => handleOpenEdit(service)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                  >
                                    <Edit size={14} />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteService(service.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. PROFESSIONALS TAB */}
          {activeNav === "professionals" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "Ana Silva",
                  role: "Especialista em Sobrancelhas",
                  initials: "AS",
                  color: "#C49A82",
                  active: true,
                },
                {
                  name: "Maria Souza",
                  role: "Esteticista Certificada",
                  initials: "MS",
                  color: "#B08898",
                  active: true,
                },
              ].map((pro) => (
                <div
                  key={pro.name}
                  className="bg-white rounded-3xl border border-border p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0"
                    style={{ background: pro.color }}
                  >
                    {pro.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-800">{pro.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{pro.role}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-[#27AE60]" />
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                        Disponível
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 rounded-full text-xs font-semibold border border-neutral-200 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 transition-colors">
                    Ver agenda
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 4. SETTINGS TAB */}
          {activeNav === "settings" && (
            <div className="bg-white rounded-2xl border border-border p-8 max-w-2xl shadow-sm">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                      Nome do Salão
                    </label>
                    <input
                      type="text"
                      value={settingsForm.salonName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, salonName: e.target.value })
                      }
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, phone: e.target.value })
                      }
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                      Horário de Funcionamento
                    </label>
                    <input
                      type="text"
                      value={settingsForm.hours}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, hours: e.target.value })
                      }
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                      Email de Notificações
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, email: e.target.value })
                      }
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <input
                    type="checkbox"
                    id="require-approval"
                    checked={settingsForm.requireApproval}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        requireApproval: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#C49A82] border-neutral-300 focus:ring-[#C49A82]"
                  />
                  <label htmlFor="require-approval" className="text-sm text-neutral-700 cursor-pointer">
                    Exigir aprovação prévia para novos agendamentos
                  </label>
                </div>

                {settingsSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-sm">
                    <CheckCircle size={16} />
                    Configurações salvas com sucesso!
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    style={{ background: ACCENT }}
                  >
                    Salvar Configurações
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* ── Right Sidebar ── */}
        <aside className="w-[260px] shrink-0 p-6 flex flex-col gap-6 overflow-y-auto border-l border-border bg-white">
          {/* Mini Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-sm font-semibold text-neutral-800"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {MONTH_NAMES[calMonth].slice(0, 3)} {calYear}
              </p>
              <div className="flex gap-0.5">
                <button
                  id="mini-prev-month"
                  onClick={prevMonth}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  id="mini-next-month"
                  onClick={nextMonth}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-1 text-center">
              {WEEK_DAYS_SHORT.map((d, i) => (
                <div key={i} className="text-[10px] text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const isToday =
                  day === today.getDate() &&
                  calMonth === today.getMonth() &&
                  calYear === today.getFullYear();
                const isSelected = day === selectedDay;
                return (
                  <div key={i} className="flex items-center justify-center">
                    <button
                      id={`mini-day-${day}`}
                      onClick={() => setSelectedDay(day)}
                      className="w-7 h-7 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
                      style={
                        isSelected
                          ? { background: ACCENT, color: "#fff", fontWeight: 600 }
                          : isToday
                          ? { background: ACCENT_LIGHT, color: ACCENT, fontWeight: 600 }
                          : { color: "var(--foreground)" }
                      }
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Quick stats summary */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
              Resumo do Dia
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Agendamentos", value: `${totalClients}`, icon: CalendarDays },
                { label: "Confirmados", value: `${totalConfirmed}`, icon: CheckCircle },
                { label: "Pendentes", value: `${totalPending}`, icon: AlertCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon size={13} />
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-800">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Professionals list */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
              Profissionais
            </p>
            <div className="flex flex-col gap-3">
              {[
                { name: "Ana Silva", initials: "AS", color: "#C49A82", count: 4 },
                { name: "Maria Souza", initials: "MS", color: "#B08898", count: 3 },
              ].map((pro) => (
                <div key={pro.name} className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                    style={{ background: pro.color }}
                  >
                    {pro.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">
                      {pro.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {pro.count} agendamentos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Revenue */}
          <div className="rounded-2xl p-4" style={{ background: ACCENT_LIGHT }}>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: ACCENT }}>
              Faturamento Estimado
            </p>
            <p
              className="text-2xl font-light"
              style={{ fontFamily: "'Playfair Display', serif", color: ACCENT }}
            >
              R$ 760
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              com base nos serviços do dia
            </p>
          </div>
        </aside>
      </div>

      {/* ──── MODAL: SERVICE CREATION / EDITION ──── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2
                className="text-xl text-foreground font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {editingService ? "Editar Serviço" : "Criar Novo Serviço"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors text-lg"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Nome do Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Massagem Terapêutica"
                    value={servName}
                    onChange={(e) => setServName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Categoria *
                  </label>
                  <select
                    value={servCategory}
                    onChange={(e) => setServCategory(e.target.value as "rosto" | "corpo")}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                  >
                    <option value="rosto">Rosto</option>
                    <option value="corpo">Corpo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Preço (BRL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: R$ 150"
                    value={servPrice}
                    onChange={(e) => setServPrice(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Duração *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 60 min"
                    value={servDuration}
                    onChange={(e) => setServDuration(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Descrição
                </label>
                <textarea
                  placeholder="Descreva brevemente o procedimento..."
                  value={servDescription}
                  onChange={(e) => setServDescription(e.target.value)}
                  rows={3}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={servImage}
                  onChange={(e) => setServImage(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                />
              </div>

              {/* Image Preview */}
              {servImage.startsWith("http") && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="w-16 h-10 rounded-lg overflow-hidden border border-neutral-200/50">
                    <img
                      src={servImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Pré-visualização
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {servImage}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit / Cancel buttons */}
              <div className="flex gap-3 pt-3 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors text-sm font-semibold text-neutral-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{ background: ACCENT }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
