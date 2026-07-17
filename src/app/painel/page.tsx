"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CalendarDays,
  Scissors,
  Tag,
  Users,
  Settings,
  LogOut,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  CircleDot,
  Lock,
  Edit,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  Upload,
  Camera,
  Globe,
  MessageCircle,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import Holidays from "date-holidays";

const hd = new Holidays("PT");

const ACCENT = "#C49A82";
const ACCENT_LIGHT = "#F5EDE6";
const SIDEBAR_BG = "#1E1B18";
const SIDEBAR_TEXT = "#C8BFB8";
const SIDEBAR_ACTIVE_BG = "#2D2722";

type AgendamentoStatus = "PENDENTE" | "CONFIRMADO" | "CONCLUIDO" | "CANCELADO" | "FALTOU";

interface ApiAgendamento {
  id: string;
  paciente_id: string;
  servico_id: string;
  inicio: string;
  fim: string;
  status: AgendamentoStatus;
  observacao?: string | null;
  created_at: string;
  updated_at: string;
  paciente?: { id: string; nome: string; telefone: string; email?: string };
  servico?: { id: string; nome: string; preco: number; duracao_minutos: number };
  profissional?: { id: string; nome: string; foto_url?: string | null };
}

interface ApiServico {
  id: string;
  categoria_id: string;
  nome: string;
  descricao?: string | null;
  foto_url?: string | null;
  duracao_minutos: number;
  preco: number;
  ativo: boolean;
  sob_consulta?: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiProfissional {
  id: string;
  nome: string;
  telefone?: string | null;
  foto_url?: string | null;
  prioridade: number;
  ativo: boolean;
  email: string | null;
  categoria: "desenvolvedor" | "dono" | "funcionario";
  status_acesso: "pendente" | "liberado";
  created_at: string;
  updated_at: string;
  servico_ids?: string[];
}

interface ApiCategoria {
  id: string;
  nome: string;
}

interface ApiConfiguracao {
  id: boolean;
  hora_abertura: string;
  hora_fechamento: string;
  almoco_inicio: string;
  almoco_fim: string;
  dias_funcionamento: number[];
  telefone?: string;
  logo_url?: string;
  nome_site?: string;
}

type DisplayStatus = "confirmed" | "pending" | "done" | "cancelled";

const STATUS_API_TO_DISPLAY: Record<AgendamentoStatus, DisplayStatus> = {
  CONFIRMADO: "confirmed",
  PENDENTE: "pending",
  CONCLUIDO: "done",
  CANCELADO: "cancelled",
  FALTOU: "cancelled",
};

const STATUS_DISPLAY_TO_API: Record<DisplayStatus, AgendamentoStatus> = {
  confirmed: "CONFIRMADO",
  pending: "PENDENTE",
  done: "CONCLUIDO",
  cancelled: "CANCELADO",
};

const STATUS_CONFIG: Record<
  DisplayStatus,
  { label: string; bg: string; text: string; dot: string; icon: React.FC<{ size: number }> }
> = {
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
  cancelled: {
    label: "Cancelado",
    bg: "#FEF2F2",
    text: "#991B1B",
    dot: "#EF4444",
    icon: X,
  },
};

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

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEK_DAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

function buildMiniCalendar(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getLisbonDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    weekday: "short",
  });
  
  const parts = formatter.formatToParts(date);
  const p: Record<string, string> = {};
  parts.forEach(part => { p[part.type] = part.value; });
  
  const weekdayMap: Record<string, number> = {
    "Sun": 0, "Sunday": 0, "Mon": 1, "Monday": 1, "Tue": 2, "Tuesday": 2,
    "Wed": 3, "Wednesday": 3, "Thu": 4, "Thursday": 4, "Fri": 5, "Friday": 5,
    "Sat": 6, "Saturday": 6
  };
  const weekdayStr = parts.find(part => part.type === "weekday")?.value || "";
  const dayOfWeek = weekdayMap[weekdayStr] !== undefined ? weekdayMap[weekdayStr] : date.getDay();
  
  return {
    year: parseInt(p.year),
    month: parseInt(p.month),
    day: parseInt(p.day),
    hour: parseInt(p.hour === "24" ? "0" : p.hour),
    minute: parseInt(p.minute),
    second: parseInt(p.second),
    dayOfWeek
  };
}

function getLisbonDate(year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Lisbon",
    timeZoneName: "longOffset"
  });
  const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
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
  
  return new Date(`${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}${offset}`);
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Lisbon",
    });
  } catch (e) {
    return "";
  }
}

function formatHour(timeStr: string): string {
  return timeStr.slice(0, 5);
}

function maskTimeInput(value: string): string {
  let val = value.replace(/\D/g, "");
  if (val.length > 4) val = val.slice(0, 4);

  if (val.length >= 1) {
    const h1 = parseInt(val[0]);
    if (h1 > 2) val = "2";
  }
  if (val.length >= 2) {
    const hour = parseInt(val.slice(0, 2));
    if (hour > 23) val = "23";
  }
  if (val.length >= 3) {
    const m1 = parseInt(val[2]);
    if (m1 > 5) val = val.slice(0, 2) + "5";
  }

  if (val.length > 2) {
    return `${val.slice(0, 2)}:${val.slice(2)}`;
  }
  return val;
}

function getWhatsAppLink(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 9 && (cleaned.startsWith("9") || cleaned.startsWith("2"))) {
    return `https://wa.me/351${cleaned}`;
  }
  return `https://wa.me/${cleaned}`;
}

/** Extrai apenas os dígitos locais (sem DDI) do número armazenado. */
function getLocalPhoneDigits(phone: string, ddi: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith(ddi)) return digits.slice(ddi.length);
  return digits;
}

function stringToColor(str: string): string {
  const palette = ["#C49A82", "#B08898", "#8FA8C0", "#8DA88A", "#A89870", "#A07888"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

const navItems = [
  { id: "agenda", label: "Agenda do Dia", icon: CalendarDays },
  { id: "services", label: "Serviços", icon: Scissors },
  { id: "categories", label: "Categorias", icon: Tag },
  { id: "professionals", label: "Profissionais", icon: Users },
  { id: "settings", label: "Configurações", icon: Settings },
];

export default function PainelPage() {
  const router = useRouter();
  const lisbonToday = getLisbonDateParts(new Date());

  const [activeNav, setActiveNav] = useState("agenda");

  const [calYear, setCalYear] = useState(lisbonToday.year);
  const [calMonth, setCalMonth] = useState(lisbonToday.month - 1);
  const [selectedDay, setSelectedDay] = useState(lisbonToday.day);

  const [agendamentos, setAgendamentos] = useState<ApiAgendamento[]>([]);
  const [servicos, setServicos] = useState<ApiServico[]>([]);
  const [profissionais, setProfissionais] = useState<ApiProfissional[]>([]);
  const [categorias, setCategorias] = useState<ApiCategoria[]>([]);
  const [configuracao, setConfiguracao] = useState<ApiConfiguracao | null>(null);
  const [proProfile, setProProfile] = useState<any>(null);
  const [agendaBlocks, setAgendaBlocks] = useState<any[]>([]);

  const [loadingAgendamentos, setLoadingAgendamentos] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingProfissionais, setLoadingProfissionais] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openAppointmentMenuId, setOpenAppointmentMenuId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [selectedApptDetails, setSelectedApptDetails] = useState<ApiAgendamento | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [editingPro, setEditingPro] = useState<ApiProfissional | null>(null);
  const [proName, setProName] = useState("");
  const [proPhone, setProPhone] = useState("");
  const [proEmail, setProEmail] = useState("");
  const [proCategoria, setProCategoria] = useState<"funcionario" | "dono" | "desenvolvedor">("funcionario");
  const [proFotoUrl, setProFotoUrl] = useState("");
  const [proServices, setProServices] = useState<string[]>([]);
  const [proModalLoading, setProModalLoading] = useState(false);
  const [proModalError, setProModalError] = useState<string | null>(null);
  const [proUploading, setProUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("");
  const [confirmModalText, setConfirmModalText] = useState("");
  const [confirmModalAction, setConfirmModalAction] = useState<(() => void | Promise<void>) | null>(null);
  const [confirmModalColor, setConfirmModalColor] = useState<"rose" | "accent">("rose");

  const requestConfirmation = (
    title: string,
    text: string,
    action: () => void | Promise<void>,
    colorType: "rose" | "accent" = "rose"
  ) => {
    setConfirmModalTitle(title);
    setConfirmModalText(text);
    setConfirmModalAction(() => action);
    setConfirmModalColor(colorType);
    setIsConfirmModalOpen(true);
  };
  const [editingService, setEditingService] = useState<ApiServico | null>(null);
  const [servName, setServName] = useState("");
  const [servCategoriaId, setServCategoriaId] = useState("");
  const [servPrice, setServPrice] = useState("");
  const [servDuration, setServDuration] = useState("");
  const [servDescription, setServDescription] = useState("");
  const [servFotoUrl, setServFotoUrl] = useState("");
  const [servSobConsulta, setServSobConsulta] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategoria | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryModalLoading, setCategoryModalLoading] = useState(false);
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);

  const [settingsForm, setSettingsForm] = useState({
    hora_abertura: "08:00",
    hora_fechamento: "18:00",
    almoco_inicio: "12:00",
    almoco_fim: "13:00",
    dias_funcionamento: [1, 2, 3, 4, 5] as number[],
    telefone: "",
    logo_url: "",
    nome_site: "",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsPhoneCountry, setSettingsPhoneCountry] = useState<"BR" | "PT">("PT");

  const fetchAgendamentos = useCallback(async () => {
    setLoadingAgendamentos(true);
    try {
      const res = await fetch("/api/agendamentos");
      if (!res.ok) throw new Error("Erro ao carregar agendamentos");
      const data: ApiAgendamento[] = await res.json();
      setAgendamentos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingAgendamentos(false);
    }
  }, []);

  const fetchServicos = useCallback(async () => {
    setLoadingServices(true);
    try {
      const res = await fetch("/api/servicos");
      if (!res.ok) throw new Error("Erro ao carregar serviços");
      const data: ApiServico[] = await res.json();
      setServicos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  const fetchProfissionais = useCallback(async () => {
    setLoadingProfissionais(true);
    try {
      const res = await fetch("/api/profissionais");
      if (!res.ok) throw new Error("Erro ao carregar profissionais");
      const data: ApiProfissional[] = await res.json();
      setProfissionais(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingProfissionais(false);
    }
  }, []);

  const fetchCategorias = useCallback(async () => {
    try {
      const res = await fetch("/api/categorias");
      if (!res.ok) throw new Error("Erro ao carregar categorias");
      const data: ApiCategoria[] = await res.json();
      setCategorias(data);
      if (data.length > 0) setServCategoriaId(data[0].id);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const fetchConfiguracoes = useCallback(async () => {
    try {
      const res = await fetch("/api/configuracoes");
      if (!res.ok) throw new Error("Erro ao carregar configurações");
      const data: ApiConfiguracao = await res.json();
      setConfiguracao(data);
      setSettingsForm({
        hora_abertura: formatHour(data.hora_abertura),
        hora_fechamento: formatHour(data.hora_fechamento),
        almoco_inicio: formatHour(data.almoco_inicio),
        almoco_fim: formatHour(data.almoco_fim),
        dias_funcionamento: data.dias_funcionamento,
        telefone: data.telefone || "",
        logo_url: data.logo_url || "",
        nome_site: data.nome_site || "",
      });
      // Auto-detectar país pelo DDI
      const digits = (data.telefone || "").replace(/\D/g, "");
      setSettingsPhoneCountry(digits.startsWith("55") ? "BR" : "PT");
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const fetchAgendaBlocks = useCallback(async () => {
    try {
      const res = await fetch("/api/bloqueios-agenda");
      if (res.ok) {
        const data = await res.json();
        setAgendaBlocks(data);
      }
    } catch (e) {
      console.error("Erro ao carregar bloqueios de agenda", e);
    }
  }, []);

  const fetchProProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setProProfile(data.data);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar perfil do profissional", e);
    }
  }, []);

  useEffect(() => {
    fetchAgendamentos();
    fetchServicos();
    fetchProfissionais();
    fetchCategorias();
    fetchConfiguracoes();
    fetchAgendaBlocks();
    fetchProProfile();
  }, [fetchAgendamentos, fetchServicos, fetchProfissionais, fetchCategorias, fetchConfiguracoes, fetchAgendaBlocks, fetchProProfile]);

  const filteredAgendamentos = agendamentos.filter((a) => {
    const parts = getLisbonDateParts(new Date(a.inicio));
    return (
      parts.year === calYear &&
      parts.month - 1 === calMonth &&
      parts.day === selectedDay
    );
  });

  const sortedAgendamentos = [...filteredAgendamentos].sort(
    (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
  );

  const totalConfirmed = sortedAgendamentos.filter((a) => a.status === "CONFIRMADO").length;
  const totalPending = sortedAgendamentos.filter((a) => a.status === "PENDENTE").length;
  const totalDone = sortedAgendamentos.filter((a) => a.status === "CONCLUIDO").length;
  const totalClients = sortedAgendamentos.filter((a) => a.status !== "CANCELADO").length;

  const estimatedRevenue = sortedAgendamentos
    .filter((a) => a.status !== "CANCELADO")
    .reduce((sum, a) => sum + (a.servico?.preco || 0), 0);

  const handleAppointmentStatus = async (id: string, displayStatus: DisplayStatus) => {
    setUpdatingStatusId(id);
    try {
      const apiStatus = STATUS_DISPLAY_TO_API[displayStatus];
      const current = agendamentos.find((a) => a.id === id);
      if (!current) return;

      const res = await fetch(`/api/agendamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: apiStatus }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao atualizar status");
      }

      const data = await res.json();
      const updated: ApiAgendamento = data.data || data;
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
      );
      setSelectedApptDetails((prev) =>
        prev && prev.id === id ? { ...prev, ...updated } : prev
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdatingStatusId(null);
      setOpenAppointmentMenuId(null);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Selecione a data e o horário");
      return;
    }
    setRescheduleLoading(true);
    setRescheduleError(null);
    try {
      const [hours, minutes] = rescheduleTime.split(":").map(Number);
      const [year, month, day] = rescheduleDate.split("-").map(Number);
      const dateInicio = new Date(year, month - 1, day, hours, minutes);

      if (isNaN(dateInicio.getTime())) {
        throw new Error("Data ou horário inválidos");
      }

      const duration = selectedApptDetails?.servico?.duracao_minutos || 30;
      const dateFim = new Date(dateInicio.getTime() + duration * 60 * 1000);

      const res = await fetch(`/api/agendamentos/${selectedApptDetails?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inicio: dateInicio.toISOString(),
          fim: dateFim.toISOString(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao reagendar");
      }

      const data = await res.json();
      const updated: ApiAgendamento = data.data || data;

      setAgendamentos((prev) =>
        prev.map((a) => (a.id === selectedApptDetails?.id ? { ...a, ...updated } : a))
      );
      setSelectedApptDetails((prev) =>
        prev && prev.id === selectedApptDetails?.id ? { ...prev, ...updated } : prev
      );

      setIsRescheduling(false);
    } catch (e: any) {
      setRescheduleError(e.message || "Ocorreu um erro ao reagendar");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setServName("");
    setServCategoriaId(categorias[0]?.id || "");
    setServPrice("");
    setServDuration("");
    setServDescription("");
    setServFotoUrl("");
    setServSobConsulta(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ApiServico) => {
    setEditingService(service);
    setServName(service.nome);
    setServCategoriaId(service.categoria_id);
    setServPrice(String(service.preco));
    setServDuration(String(service.duracao_minutos));
    setServDescription(service.descricao || "");
    setServFotoUrl(service.foto_url || "");
    setServSobConsulta(service.sob_consulta || false);
    setModalError(null);
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setModalError("O arquivo é muito grande. Tamanho máximo permitido: 5MB.");
      return;
    }

    setUploading(true);
    setModalError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro no upload.");
      }

      const data = await res.json();
      setServFotoUrl(data.url);
    } catch (err: any) {
      setModalError(err.message || "Erro ao carregar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servName.trim() || (!servSobConsulta && !servPrice) || !servDuration || !servCategoriaId) {
      setModalError("Preencha todos os campos obrigatórios.");
      return;
    }
    setModalLoading(true);
    setModalError(null);
    try {
      const payload = {
        nome: servName.trim(),
        categoria_id: servCategoriaId,
        preco: servSobConsulta ? 0 : parseFloat(servPrice),
        duracao_minutos: parseInt(servDuration),
        descricao: servDescription.trim() || null,
        foto_url: servFotoUrl.trim() || null,
        sob_consulta: servSobConsulta,
      };

      if (editingService) {
        const res = await fetch(`/api/servicos/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Erro ao atualizar serviço");
        }
        const data = await res.json();
        const updated: ApiServico = data.data || data;
        setServicos((prev) =>
          prev.map((s) => (s.id === editingService.id ? updated : s))
        );
      } else {
        const res = await fetch("/api/servicos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Erro ao criar serviço");
        }
        const data = await res.json();
        const created: ApiServico = data.data || data;
        setServicos((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (e: any) {
      setModalError(e.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteService = (id: string) => {
    requestConfirmation(
      "Excluir Serviço",
      "Deseja realmente excluir este serviço? Todos os agendamentos associados também serão excluídos. Esta ação não pode ser desfeita.",
      async () => {
        try {
          const res = await fetch(`/api/servicos/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Erro ao excluir serviço");
          }
          setServicos((prev) => prev.filter((s) => s.id !== id));
          setOpenMenuId(null);
        } catch (e: any) {
          setError(e.message);
        }
      },
      "rose"
    );
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryModalError(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: ApiCategoria) => {
    setEditingCategory(category);
    setCategoryName(category.nome);
    setCategoryModalError(null);
    setOpenMenuId(null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setCategoryModalError("Preencha o nome da categoria.");
      return;
    }
    setCategoryModalLoading(true);
    setCategoryModalError(null);
    try {
      const payload = {
        nome: categoryName.trim(),
      };

      if (editingCategory) {
        const res = await fetch(`/api/categorias/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Erro ao atualizar categoria");
        }
        const data = await res.json();
        const updated: ApiCategoria = data.data || data;
        setCategorias((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? updated : c))
        );
      } else {
        const res = await fetch("/api/categorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Erro ao criar categoria");
        }
        const data = await res.json();
        const created: ApiCategoria = data.data || data;
        setCategorias((prev) => [...prev, created]);
      }
      setIsCategoryModalOpen(false);
    } catch (e: any) {
      setCategoryModalError(e.message);
    } finally {
      setCategoryModalLoading(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    requestConfirmation(
      "Excluir Categoria",
      "Deseja realmente excluir esta categoria? Os serviços associados a ela poderão ficar sem categoria.",
      async () => {
        try {
          const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Erro ao excluir categoria");
          }
          setCategorias((prev) => prev.filter((c) => c.id !== id));
          setOpenMenuId(null);
        } catch (e: any) {
          setError(e.message);
        }
      },
      "rose"
    );
  };

  const handleProFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProModalError("O arquivo é muito grande. Tamanho máximo permitido: 5MB.");
      return;
    }

    setProUploading(true);
    setProModalError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro no upload.");
      }

      const data = await res.json();
      setProFotoUrl(data.url);
    } catch (err: any) {
      setProModalError(err.message || "Erro ao carregar imagem.");
    } finally {
      setProUploading(false);
    }
  };

  const handleOpenAddPro = () => {
    setEditingPro(null);
    setProName("");
    setProPhone("");
    setProEmail("");
    setProCategoria("funcionario");
    setProFotoUrl("");
    setProServices([]);
    setProModalError(null);
    setIsProModalOpen(true);
  };

  const handleOpenEditPro = async (pro: ApiProfissional) => {
    setProModalError(null);
    setProModalLoading(true);
    setIsProModalOpen(true);
    try {
      const res = await fetch(`/api/profissionais/${pro.id}`);
      if (res.ok) {
        const data = await res.json();
        setEditingPro(pro);
        setProName(data.nome);
        setProPhone(data.telefone || "");
        setProEmail(data.email || "");
        setProCategoria(data.categoria || "funcionario");
        setProFotoUrl(data.foto_url || "");
        setProServices(data.servico_ids || []);
      } else {
        throw new Error("Erro ao obter dados do profissional.");
      }
    } catch (e: any) {
      setProModalError(e.message);
    } finally {
      setProModalLoading(false);
    }
  };

  const handleDeletePro = (id: string) => {
    requestConfirmation(
      "Remover Profissional",
      "Tem certeza que deseja remover este profissional? Todos os dados associados a ele serão perdidos.",
      async () => {
        try {
          const res = await fetch(`/api/profissionais/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Erro ao remover profissional.");
          }
          fetchProfissionais();
        } catch (e: any) {
          setError(e.message);
        }
      },
      "rose"
    );
  };

  const handleApprovePro = async (id: string) => {
    try {
      const res = await fetch(`/api/profissionais/${id}/acesso`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_acesso: "liberado" }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao aprovar profissional.");
      }
      fetchProfissionais();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleRestrictPro = async (id: string) => {
    try {
      const res = await fetch(`/api/profissionais/${id}/acesso`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_acesso: "pendente" }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao restringir profissional.");
      }
      fetchProfissionais();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleResetPasswordPro = (id: string) => {
    requestConfirmation(
      "Resetar Palavra-passe",
      "Deseja realmente redefinir a palavra-passe deste profissional? Ele precisará configurar uma nova no próximo acesso.",
      async () => {
        try {
          const res = await fetch(`/api/profissionais/${id}/reset-senha`, {
            method: "POST",
          });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Erro ao redefinir palavra-passe.");
          }
          fetchProfissionais();
        } catch (e: any) {
          setError(e.message);
        }
      },
      "accent"
    );
  };

  const handleSavePro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proName.trim()) {
      setProModalError("Nome é obrigatório");
      return;
    }
    if (!proEmail.trim()) {
      setProModalError("Email é obrigatório");
      return;
    }

    setProModalLoading(true);
    setProModalError(null);

    const payload = {
      nome: proName.trim(),
      telefone: proPhone.trim() || null,
      email: proEmail.trim(),
      categoria: proCategoria,
      foto_url: proFotoUrl || null,
      servico_ids: proServices,
      ...(editingPro ? {} : { status_acesso: "liberado" })
    };

    try {
      const url = editingPro ? `/api/profissionais/${editingPro.id}` : "/api/profissionais";
      const method = editingPro ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao salvar profissional.");
      }

      fetchProfissionais();
      setIsProModalOpen(false);
    } catch (e: any) {
      setProModalError(e.message);
    } finally {
      setProModalLoading(false);
    }
  };

  const handleToggleProService = (id: string) => {
    setProServices((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleProLogout = async () => {
    try {
      await fetch("/api/profissionais/auth", { method: "DELETE" });
      window.location.href = "/login?role=profissional";
    } catch (e) {
      console.error("Erro ao fazer logout", e);
      router.push("/login?role=profissional");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSuccess(false);

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(settingsForm.hora_abertura) ||
        !timeRegex.test(settingsForm.hora_fechamento) ||
        !timeRegex.test(settingsForm.almoco_inicio) ||
        !timeRegex.test(settingsForm.almoco_fim)) {
      setSettingsError("O formato das horas deve ser HH:MM (ex: 08:00, 18:30)");
      setSettingsLoading(false);
      return;
    }

    // Validar e normalizar número de telefone
    const ddi = settingsPhoneCountry === "BR" ? "55" : "351";
    const localDigits = getLocalPhoneDigits(settingsForm.telefone, ddi);
    let normalizedPhone = "";
    if (localDigits) {
      if (settingsPhoneCountry === "PT" && !/^[92]\d{8}$/.test(localDigits)) {
        setSettingsError("Número português inválido. Use 9 dígitos começando com 9 ou 2 (ex: 912345678).");
        setSettingsLoading(false);
        return;
      }
      if (settingsPhoneCountry === "BR" && !/^\d{10,11}$/.test(localDigits)) {
        setSettingsError("Número brasileiro inválido. Use DDD + número com 10 ou 11 dígitos (ex: 11999999999).");
        setSettingsLoading(false);
        return;
      }
      normalizedPhone = `+${ddi}${localDigits}`;
    }

    try {
      const payload = {
        hora_abertura: settingsForm.hora_abertura + ":00",
        hora_fechamento: settingsForm.hora_fechamento + ":00",
        almoco_inicio: settingsForm.almoco_inicio + ":00",
        almoco_fim: settingsForm.almoco_fim + ":00",
        dias_funcionamento: settingsForm.dias_funcionamento,
        telefone: normalizedPhone,
        logo_url: settingsForm.logo_url,
        nome_site: settingsForm.nome_site,
      };
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao salvar configurações");
      }
      const data = await res.json();
      setConfiguracao(data.data || data);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (e: any) {
      setSettingsError(e.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const cells = buildMiniCalendar(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const daysWithAppts = new Set(
    agendamentos.map((a) => {
      const parts = getLisbonDateParts(new Date(a.inicio));
      if (parts.year === calYear && parts.month - 1 === calMonth)
        return parts.day;
      return null;
    }).filter(Boolean)
  );

  const proAppointmentCount = (profId: string) =>
    sortedAgendamentos.filter(
      (a) => a.profissional?.id === profId && a.status !== "CANCELADO"
    ).length;

  const checkIsDayBlocked = (day: number) => {
    const dayStart = getLisbonDate(calYear, calMonth, day, 0, 0, 0);
    const dayEnd = getLisbonDate(calYear, calMonth, day, 23, 59, 59);
    return agendaBlocks.some((block: any) => {
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
  };

  const checkIsHolidayUnblocked = (day: number) => {
    const dayStart = getLisbonDate(calYear, calMonth, day, 0, 0, 0);
    const dayEnd = getLisbonDate(calYear, calMonth, day, 23, 59, 59);
    return agendaBlocks.some((block: any) => {
      if (block.motivo !== "DESBLOQUEIO_FERIADO") return false;
      const blockStart = new Date(block.inicio);
      const blockEnd = new Date(block.fim);
      const overlapStart = new Date(Math.max(dayStart.getTime(), blockStart.getTime()));
      const overlapEnd = new Date(Math.min(dayEnd.getTime(), blockEnd.getTime()));
      return overlapStart < overlapEnd;
    });
  };

  const handleBlockDay = async () => {
    if (!selectedDay) return;

    let targetProId = proProfile?.id;
    if (!targetProId && profissionais.length > 0) {
      targetProId = profissionais[0].id;
    }

    if (!targetProId) {
      setError("Nenhum profissional cadastrado para associar ao bloqueio de agenda.");
      return;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(selectedDay)}`;

    const blockPayload = {
      profissional_id: targetProId,
      inicio: `${dateStr}T00:00:00.000Z`,
      fim: `${dateStr}T23:59:59.000Z`,
      motivo: "Bloqueio de Agenda da Equipe",
    };

    try {
      const res = await fetch("/api/bloqueios-agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao bloquear dia.");
      }

      await fetchAgendaBlocks();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleUnblockDay = async () => {
    if (!selectedDay) return;

    const dayStart = new Date(calYear, calMonth, selectedDay, 0, 0, 0);
    const dayEnd = new Date(calYear, calMonth, selectedDay, 23, 59, 59);

    const blocksToDelete = agendaBlocks.filter((block: any) => {
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

    try {
      for (const block of blocksToDelete) {
        const res = await fetch(`/api/bloqueios-agenda/${block.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Erro ao remover bloqueio.");
        }
      }
      await fetchAgendaBlocks();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleUnblockHoliday = async () => {
    if (!selectedDay) return;

    let targetProId = proProfile?.id;
    if (!targetProId && profissionais.length > 0) {
      targetProId = profissionais[0].id;
    }

    if (!targetProId) {
      setError("Nenhum profissional cadastrado.");
      return;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(selectedDay)}`;

    const blockPayload = {
      profissional_id: targetProId,
      inicio: `${dateStr}T00:00:00.000Z`,
      fim: `${dateStr}T23:59:59.000Z`,
      motivo: "DESBLOQUEIO_FERIADO",
    };

    try {
      const res = await fetch("/api/bloqueios-agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao desbloquear feriado.");
      }

      await fetchAgendaBlocks();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleBlockHoliday = async () => {
    if (!selectedDay) return;

    const dayStart = new Date(calYear, calMonth, selectedDay, 0, 0, 0);
    const dayEnd = new Date(calYear, calMonth, selectedDay, 23, 59, 59);

    const blocksToDelete = agendaBlocks.filter((block: any) => {
      if (block.motivo !== "DESBLOQUEIO_FERIADO") return false;
      const blockStart = new Date(block.inicio);
      const blockEnd = new Date(block.fim);

      const overlapStart = new Date(Math.max(dayStart.getTime(), blockStart.getTime()));
      const overlapEnd = new Date(Math.min(dayEnd.getTime(), blockEnd.getTime()));
      return overlapStart < overlapEnd;
    });

    try {
      for (const block of blocksToDelete) {
        const res = await fetch(`/api/bloqueios-agenda/${block.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Erro ao bloquear feriado.");
        }
      }
      await fetchAgendaBlocks();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const toggleDia = (dia: number) => {
    setSettingsForm((prev) => ({
      ...prev,
      dias_funcionamento: prev.dias_funcionamento.includes(dia)
        ? prev.dias_funcionamento.filter((d) => d !== dia)
        : [...prev.dias_funcionamento, dia].sort(),
    }));
  };

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#F5F0EB" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[220px] shrink-0 flex flex-col py-6 px-4 gap-2 transition-transform duration-300 md:static md:translate-x-0 md:z-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: SIDEBAR_BG }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-2 mb-6 cursor-pointer"
          onClick={() => { router.push("/"); setIsSidebarOpen(false); }}
        >
          <img
            src={configuracao?.logo_url || "/logo.png"}
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-white/10 shrink-0"
          />
          <div>
            <p
              className="text-sm leading-tight text-white font-medium truncate max-w-[130px]"
              style={{ fontFamily: "'Playfair Display', serif" }}
              title={configuracao?.nome_site || "Cristiane Vasconcelos Clinic"}
            >
              {configuracao?.nome_site ? configuracao.nome_site.replace(" Clinic", "") : "Cristiane Vasconcelos"}
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
                onClick={() => {
                  setActiveNav(item.id);
                  setIsSidebarOpen(false);
                }}
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

          {/* External link to client-facing site */}
          <button
            onClick={() => window.open("/", "_blank")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left w-full cursor-pointer text-[#C8BFB8] hover:bg-white/5 mt-4 border-t border-white/5 pt-4"
          >
            <Globe size={16} className="text-[#C49A82]" />
            Visualizar Site
          </button>
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-1 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            {proProfile?.foto_url ? (
              <img
                src={proProfile.foto_url}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-white/20"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                style={{ background: ACCENT }}
              >
                {proProfile?.nome ? proProfile.nome.charAt(0).toUpperCase() : "AD"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{proProfile?.nome || "Admin"}</p>
              <p className="text-[10px] text-white/40 truncate">
                {proProfile?.categoria === "dono"
                  ? "Proprietário"
                  : proProfile?.categoria === "funcionario"
                  ? "Funcionário"
                  : "Administrador"}
              </p>
            </div>
          </div>
          <button
            id="btn-logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left w-full text-[#C8BFB8] hover:bg-white/5 cursor-pointer"
            onClick={handleProLogout}
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      {/* Left Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          {/* Global error */}
          {error && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700">
              <AlertTriangle size={16} className="shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700">
                <X size={15} />
              </button>
            </div>
          )}

          {/* Top Bar / Header */}
          <div className="flex items-center justify-between mb-8 border-b border-neutral-200/50 pb-5 gap-3">
            <div className="flex items-center min-w-0 gap-3">
              {/* Sidebar toggle button for mobile */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
                title="Abrir menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 truncate">
                  {MONTH_NAMES[lisbonToday.month - 1]} {lisbonToday.year}
                </p>
                <h1
                  className="text-2xl sm:text-3xl text-foreground font-semibold truncate"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {activeNav === "agenda" && "Agenda do Dia"}
                  {activeNav === "services" && "Nossos Serviços"}
                  {activeNav === "categories" && "Categorias de Serviços"}
                  {activeNav === "professionals" && "Lista de Profissionais"}
                  {activeNav === "settings" && "Configurações do Painel"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {activeNav === "agenda" && (
                <>
                  <button
                    id="btn-refresh-agenda"
                    onClick={fetchAgendamentos}
                    disabled={loadingAgendamentos}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={loadingAgendamentos ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>

                  {/* Calendar toggle button for mobile/tablet */}
                  <button
                    onClick={() => setIsRightSidebarOpen(true)}
                    className="xl:hidden flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0"
                    title="Calendário e Resumo"
                  >
                    <CalendarDays size={14} className="sm:size-[16px]" />
                  </button>
                </>
              )}

              {activeNav === "services" && (
                <button
                  id="btn-new-service"
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{ background: ACCENT }}
                >
                  <Plus size={14} />
                  Novo Serviço
                </button>
              )}

              {activeNav === "categories" && (
                <button
                  id="btn-new-category"
                  onClick={handleOpenAddCategory}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{ background: ACCENT }}
                >
                  <Plus size={14} />
                  Nova Categoria
                </button>
              )}

              {activeNav === "professionals" && (proProfile?.categoria === "dono" || proProfile?.categoria === "desenvolvedor") && (
                <button
                  id="btn-new-professional"
                  onClick={handleOpenAddPro}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{ background: ACCENT }}
                >
                  <Plus size={14} />
                  Novo Profissional
                </button>
              )}
            </div>
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
                    <div className="w-2 h-2 rounded-full mb-3" style={{ background: stat.color }} />
                    <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Agendamentos list */}
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="text-sm font-semibold text-foreground">
                    Agendamentos — {selectedDay} de {MONTH_NAMES[calMonth]}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {sortedAgendamentos.length} registros
                  </span>
                </div>

                {loadingAgendamentos ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : sortedAgendamentos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <CalendarDays size={40} className="text-neutral-200 mb-3" />
                    <p className="text-sm">Nenhum agendamento neste dia.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border" style={{ minHeight: sortedAgendamentos.length > 0 && sortedAgendamentos.length <= 2 ? '240px' : 'auto' }}>
                    {sortedAgendamentos.map((appt, index) => {
                      const displayStatus = STATUS_API_TO_DISPLAY[appt.status];
                      const cfg = STATUS_CONFIG[displayStatus];
                      const Icon = cfg.icon;
                      const proName = appt.profissional?.nome || "—";
                      const clientName = appt.paciente?.nome || "Cliente";
                      const clientColor = stringToColor(clientName);
                      const clientInitials = getInitials(clientName);
                      const clientPhone = appt.paciente?.telefone;
                      const serviceName = appt.servico?.nome || "Serviço";

                      return (
                        <div
                          key={appt.id}
                          id={`appt-${appt.id}`}
                          onClick={() => setSelectedApptDetails(appt)}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/35 transition-colors cursor-pointer"
                        >
                          {/* Time */}
                          <div className="w-16 shrink-0">
                            <p className="text-sm font-semibold text-foreground">
                              {formatTime(appt.inicio)}
                            </p>
                          </div>

                          {/* Client avatar */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                            style={{ background: clientColor }}
                          >
                            {clientInitials}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {clientName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-muted-foreground truncate">{serviceName}</p>
                              {appt.profissional && (
                                <>
                                  <span className="text-muted-foreground opacity-40">·</span>
                                  <p className="text-xs text-muted-foreground truncate">{proName}</p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status badge */}
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                            style={{ background: cfg.bg, color: cfg.text }}
                          >
                            {updatingStatusId === appt.id ? (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Icon size={11} />
                            )}
                            {cfg.label}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0 relative">
                            {clientPhone && (
                              <a
                                href={getWhatsAppLink(clientPhone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Enviar WhatsApp"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageCircle size={15} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 2. SERVICES TAB */}
          {activeNav === "services" && (
            <div className="space-y-6">
              {loadingServices ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-7 h-7 border-2 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : servicos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground">
                  <Scissors size={48} className="mx-auto text-neutral-300 mb-4" />
                  <p className="text-lg">Nenhum serviço cadastrado.</p>
                  <p className="text-sm mt-1">Crie um novo serviço no botão acima.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border shadow-sm">
                  <div className="overflow-x-auto overflow-y-visible" style={{ minHeight: servicos.length > 0 && servicos.length <= 2 ? '200px' : 'auto' }}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                          <th className="px-6 py-4">Serviço</th>
                          <th className="px-6 py-4">Categoria</th>
                          <th className="px-6 py-4">Duração</th>
                          <th className="px-6 py-4">Preço</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {servicos.map((service, index) => {
                          const categoria = categorias.find((c) => c.id === service.categoria_id);
                          return (
                            <tr key={service.id} className="hover:bg-neutral-50/50 transition-all">
                              {/* Name */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-100 bg-neutral-100 flex items-center justify-center">
                                    {service.foto_url ? (
                                      <img
                                        src={service.foto_url}
                                        alt={service.nome}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <Scissors size={16} className="text-neutral-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-neutral-800 truncate">
                                      {service.nome}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {service.descricao || "Sem descrição"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="px-6 py-4">
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#FAF3E0] text-[#B7770D]">
                                  {categoria?.nome || "—"}
                                </span>
                              </td>

                              {/* Duration */}
                              <td className="px-6 py-4 text-sm text-neutral-600">
                                <div className="flex items-center gap-1">
                                  <Clock size={13} />
                                  {service.duracao_minutos} min
                                </div>
                              </td>

                              {/* Price */}
                              <td className="px-6 py-4 text-sm font-semibold text-neutral-800">
                                {service.sob_consulta ? (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Sob Consulta</span>
                                ) : (
                                  <>€ {Number(service.preco).toFixed(2)}</>
                                )}
                              </td>

                              {/* Active status */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    service.ativo
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-neutral-100 text-neutral-600"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      service.ativo ? "bg-emerald-500" : "bg-neutral-400"
                                    }`}
                                  />
                                  {service.ativo ? "Ativo" : "Inativo"}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right relative">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === service.id ? null : service.id)}
                                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                                >
                                  <MoreHorizontal size={16} />
                                </button>

                                {openMenuId === service.id && (
                                  <div className="absolute right-6 top-12 z-10 w-36 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 overflow-hidden">
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeNav === "categories" && (
            <div className="space-y-6">
              {categorias.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground">
                  <Tag size={48} className="mx-auto text-neutral-300 mb-4" />
                  <p className="text-lg">Nenhuma categoria cadastrada.</p>
                  <p className="text-sm mt-1">Crie uma nova categoria no botão acima.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                          <th className="px-6 py-4">Nome da Categoria</th>
                          <th className="px-6 py-4">Serviços Associados</th>
                          <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {categorias.map((category) => {
                          const assocServicesCount = servicos.filter(
                            (s) => s.categoria_id === category.id
                          ).length;
                          return (
                            <tr key={category.id} className="hover:bg-neutral-50/50 transition-all">
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-neutral-800">
                                  {category.nome}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-neutral-600">
                                  {assocServicesCount} {assocServicesCount === 1 ? "serviço" : "serviços"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEditCategory(category)}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Excluir"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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
              {loadingProfissionais ? (
                <div className="col-span-2 flex items-center justify-center py-24">
                  <div className="w-7 h-7 border-2 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : profissionais.length === 0 ? (
                <div className="col-span-2 bg-white rounded-2xl border border-border p-12 text-center text-muted-foreground">
                  <Users size={48} className="mx-auto text-neutral-300 mb-4" />
                  <p className="text-lg">Nenhum profissional cadastrado.</p>
                </div>
              ) : (
                profissionais.map((pro) => {
                  const color = stringToColor(pro.nome);
                  const initials = getInitials(pro.nome);
                  const isLiberado = pro.status_acesso === "liberado";
                  const isAtivo = pro.ativo;
                  return (
                    <div
                      key={pro.id}
                      className="bg-white rounded-3xl border border-border p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {pro.foto_url ? (
                          <img
                            src={pro.foto_url}
                            alt={pro.nome}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                            style={{ background: color }}
                          >
                            {initials}
                          </div>
                        )}
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                          style={{ background: isAtivo && isLiberado ? "#27AE60" : "#ADADAD" }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-800">{pro.nome}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {pro.categoria}
                        </p>
                        {pro.email && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            {pro.email}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full"
                            style={
                              isLiberado
                                ? { background: "#EAFAF1", color: "#1E8449" }
                                : { background: "#FEF9E7", color: "#B7770D" }
                            }
                          >
                            {isLiberado ? "Liberado" : "Pendente"}
                          </span>
                        </div>
                      </div>

                      {/* Appointments count & Actions */}
                      <div className="flex items-center gap-4 shrink-0 relative">
                        <div className="text-right">
                          <p
                            className="text-2xl font-light"
                            style={{ fontFamily: "'Playfair Display', serif", color }}
                          >
                            {proAppointmentCount(pro.id)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">hoje</p>
                        </div>

                        {/* Actions dropdown */}
                        {(proProfile?.categoria === "dono" || proProfile?.categoria === "desenvolvedor") && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(openMenuId === pro.id ? null : pro.id)}
                              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 transition-all cursor-pointer animate-none inline-flex items-center justify-center border-none shadow-none"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {openMenuId === pro.id && (
                              <div className="absolute right-0 mt-2 z-30 bg-white border border-neutral-100 rounded-2xl shadow-xl py-1.5 min-w-[160px] text-left">
                                {isLiberado ? (
                                  pro.id !== proProfile?.id && (
                                    <button
                                      type="button"
                                      onClick={() => { handleRestrictPro(pro.id); setOpenMenuId(null); }}
                                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer border-none bg-transparent"
                                    >
                                      <Lock size={12} />
                                      Bloquear Acesso
                                    </button>
                                  )
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => { handleApprovePro(pro.id); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer border-none bg-transparent"
                                  >
                                    <CheckCircle size={12} />
                                    Liberar Acesso
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => { handleOpenEditPro(pro); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer border-none bg-transparent"
                                >
                                  <Edit size={12} />
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  onClick={() => { handleResetPasswordPro(pro.id); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#C49A82] hover:bg-neutral-50 transition-colors cursor-pointer border-none bg-transparent"
                                >
                                  <RefreshCw size={12} />
                                  Resetar Senha
                                </button>

                                {pro.id !== proProfile?.id && (
                                  <button
                                    type="button"
                                    onClick={() => { handleDeletePro(pro.id); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
                                  >
                                    <Trash2 size={12} />
                                    Remover
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 4. SETTINGS TAB */}
          {activeNav === "settings" && (
            <div className="bg-white rounded-2xl border border-border p-8 max-w-2xl shadow-sm">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                      Abertura
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="Ex: 08:00"
                      key={configuracao ? "loaded-abertura" : "loading-abertura"}
                      defaultValue={settingsForm.hora_abertura}
                      onChange={(e) => {
                        const formatted = maskTimeInput(e.target.value);
                        e.target.value = formatted;
                        setSettingsForm((prev) => ({ ...prev, hora_abertura: formatted }));
                      }}
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                      Fechamento
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="Ex: 18:00"
                      key={configuracao ? "loaded-fechamento" : "loading-fechamento"}
                      defaultValue={settingsForm.hora_fechamento}
                      onChange={(e) => {
                        const formatted = maskTimeInput(e.target.value);
                        e.target.value = formatted;
                        setSettingsForm((prev) => ({ ...prev, hora_fechamento: formatted }));
                      }}
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                      Início do Almoço
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="Ex: 12:00"
                      key={configuracao ? "loaded-almoco-inicio" : "loading-almoco-inicio"}
                      defaultValue={settingsForm.almoco_inicio}
                      onChange={(e) => {
                        const formatted = maskTimeInput(e.target.value);
                        e.target.value = formatted;
                        setSettingsForm((prev) => ({ ...prev, almoco_inicio: formatted }));
                      }}
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                      Fim do Almoço
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="Ex: 13:00"
                      key={configuracao ? "loaded-almoco-fim" : "loading-almoco-fim"}
                      defaultValue={settingsForm.almoco_fim}
                      onChange={(e) => {
                        const formatted = maskTimeInput(e.target.value);
                        e.target.value = formatted;
                        setSettingsForm((prev) => ({ ...prev, almoco_fim: formatted }));
                      }}
                      className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                    />
                  </div>
                </div>

                {/* Days of operation */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                    Dias de Funcionamento
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAY_LABELS.map((label, idx) => {
                      const active = settingsForm.dias_funcionamento.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDia(idx)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
                          style={
                            active
                              ? { background: ACCENT, color: "#fff", borderColor: ACCENT }
                              : { background: "#fff", color: "#7D7D7D", borderColor: "#e5e7eb" }
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clinic Contact & Brand Settings */}
                <div className="border-t border-neutral-100 pt-6 space-y-5">
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Informações da Clínica &amp; Aparência
                  </h3>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                        Nome do Site / Clínica
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Cristiane Vasconcelos Clinic"
                        value={settingsForm.nome_site}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({ ...prev, nome_site: e.target.value }))
                        }
                        className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                        Telemóvel / Telefone (WhatsApp)
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={settingsPhoneCountry}
                          onChange={(e) => {
                            const country = e.target.value as "BR" | "PT";
                            const oldDdi = settingsPhoneCountry === "BR" ? "55" : "351";
                            const local = getLocalPhoneDigits(settingsForm.telefone, oldDdi);
                            const newDdi = country === "BR" ? "55" : "351";
                            setSettingsPhoneCountry(country);
                            setSettingsForm((prev) => ({ ...prev, telefone: local ? `+${newDdi}${local}` : "" }));
                          }}
                          className="px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50 shrink-0 cursor-pointer"
                        >
                          <option value="PT">🇵🇹 +351</option>
                          <option value="BR">🇧🇷 +55</option>
                        </select>
                        <input
                          type="text"
                          placeholder={settingsPhoneCountry === "PT" ? "912 345 678" : "11 99999-9999"}
                          value={getLocalPhoneDigits(settingsForm.telefone, settingsPhoneCountry === "BR" ? "55" : "351")}
                          onChange={(e) => {
                            const local = e.target.value.replace(/\D/g, "");
                            const d = settingsPhoneCountry === "BR" ? "55" : "351";
                            setSettingsForm((prev) => ({ ...prev, telefone: local ? `+${d}${local}` : "" }));
                          }}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] transition-colors bg-neutral-50/50"
                        />
                      </div>
                      <p className="text-xs text-neutral-400">
                        {settingsPhoneCountry === "PT"
                          ? "Ex: 912 345 678 (9 dígitos)"
                          : "Ex: 11 99999-9999 (DDD + número)"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wide">
                        Logo da Clínica
                      </label>
                      <div className="flex items-center gap-3">
                        {settingsForm.logo_url ? (
                          <img
                            src={settingsForm.logo_url}
                            alt="Preview Logo"
                            className="w-10 h-10 rounded-full object-cover shadow-sm border border-neutral-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                            <Camera size={16} className="text-neutral-400" />
                          </div>
                        )}
                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700 font-medium cursor-pointer hover:bg-neutral-100 transition-colors">
                          <Upload size={14} />
                          {settingsLoading ? "A carregar..." : "Escolher imagem"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                setSettingsLoading(true);
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });
                                if (!res.ok) throw new Error("Erro ao fazer upload");
                                const uploadData = await res.json();
                                setSettingsForm((prev) => ({ ...prev, logo_url: uploadData.url }));
                              } catch (err: any) {
                                setSettingsError("Falha no upload da logo: " + err.message);
                              } finally {
                                setSettingsLoading(false);
                              }
                            }}
                          />
                        </label>
                        {settingsForm.logo_url && (
                          <button
                            type="button"
                            onClick={() => setSettingsForm((prev) => ({ ...prev, logo_url: "" }))}
                            className="text-xs text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {settingsError && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-sm">
                    <AlertTriangle size={16} />
                    {settingsError}
                  </div>
                )}

                {settingsSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-sm">
                    <CheckCircle size={16} />
                    Configurações salvas com sucesso!
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    style={{ background: ACCENT }}
                  >
                    {settingsLoading ? "Salvando..." : "Salvar Configurações"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* ── Right Sidebar ── */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-[260px] shrink-0 p-6 flex flex-col gap-6 overflow-y-auto border-l border-border bg-white transition-transform duration-300 xl:static xl:translate-x-0 xl:z-auto ${
            isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
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
                  day === lisbonToday.day &&
                  calMonth === lisbonToday.month - 1 &&
                  calYear === lisbonToday.year;
                const isSelected = day === selectedDay;
                const hasAppts = daysWithAppts.has(day);
                const isHoliday = getHolidayName(calYear, calMonth, day) !== null;
                const isBlocked = checkIsDayBlocked(day);
                const isHolidayUnblocked = isHoliday && checkIsHolidayUnblocked(day);
                const isInactive = (isHoliday && !isHolidayUnblocked) || isBlocked;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <button
                      id={`mini-day-${day}`}
                      onClick={() => {
                        setSelectedDay(day);
                        setIsRightSidebarOpen(false);
                      }}
                      className="w-7 h-7 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
                      style={
                        isSelected
                          ? { background: ACCENT, color: "#fff", fontWeight: 600 }
                          : isToday
                          ? { background: ACCENT_LIGHT, color: ACCENT, fontWeight: 600 }
                          : isInactive
                          ? { color: "#A3A3A3", textDecoration: "line-through", opacity: 0.7 }
                          : { color: "var(--foreground)" }
                      }
                    >
                      {day}
                    </button>
                    {hasAppts && !isSelected && (
                      <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: ACCENT }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Quick stats */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
              Resumo do Dia
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Agendamentos", value: String(totalClients), icon: CalendarDays },
                { label: "Confirmados", value: String(totalConfirmed), icon: CheckCircle },
                { label: "Pendentes", value: String(totalPending), icon: AlertCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon size={13} />
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-800">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Day block management */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
              Bloqueio de Agenda
            </p>
            {getHolidayName(calYear, calMonth, selectedDay) ? (
              <div>
                {checkIsHolidayUnblocked(selectedDay) ? (
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-xs font-semibold text-emerald-800">Feriado (Aberto/Trabalhando)</span>
                      <p className="text-xs text-emerald-700 mt-1 font-medium">
                        {getHolidayName(calYear, calMonth, selectedDay)}
                      </p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        Este feriado está aberto para agendamentos.
                      </p>
                    </div>
                    <button
                      onClick={handleBlockHoliday}
                      className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Bloquear Feriado
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <span className="text-xs font-semibold text-neutral-600">Feriado (Fechado)</span>
                      <p className="text-xs text-neutral-500 mt-1 font-medium">
                        {getHolidayName(calYear, calMonth, selectedDay)}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Fechado por padrão. Clientes não podem agendar.
                      </p>
                    </div>
                    <button
                      onClick={handleUnblockHoliday}
                      className="w-full py-2 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
                      style={{ background: ACCENT }}
                    >
                      Trabalhar neste Feriado
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {checkIsDayBlocked(selectedDay) ? (
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 font-medium">
                      Esta data está bloqueada para novos agendamentos de clientes.
                    </div>
                    <button
                      onClick={handleUnblockDay}
                      className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Desbloquear Dia
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleBlockDay}
                      className="w-full py-2 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
                      style={{ background: ACCENT }}
                    >
                      Bloquear este Dia
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          {/* Profissionais list */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
              Profissionais
            </p>
            <div className="flex flex-col gap-3">
              {profissionais.slice(0, 5).map((pro) => {
                const color = stringToColor(pro.nome);
                const initials = getInitials(pro.nome);
                const count = proAppointmentCount(pro.id);
                return (
                  <div key={pro.id} className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 truncate">{pro.nome}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {count} agendamentos hoje
                      </p>
                    </div>
                  </div>
                );
              })}
              {profissionais.length === 0 && !loadingProfissionais && (
                <p className="text-xs text-muted-foreground">Nenhum profissional.</p>
              )}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Revenue */}
          <div className="rounded-2xl p-4" style={{ background: ACCENT_LIGHT }}>
            <p
              className="text-[10px] uppercase tracking-widest font-bold mb-1"
              style={{ color: ACCENT }}
            >
              Faturamento Estimado
            </p>
            <p
              className="text-2xl font-light"
              style={{ fontFamily: "'Playfair Display', serif", color: ACCENT }}
            >
              € {estimatedRevenue.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              com base nos serviços do dia
            </p>
          </div>
        </aside>

        {/* Right Sidebar backdrop overlay */}
        {isRightSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 xl:hidden"
            onClick={() => setIsRightSidebarOpen(false)}
          />
        )}
      </div>

      {/* ── MODAL: SERVICE CREATION / EDITION ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
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
                className="text-neutral-400 hover:text-neutral-700 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100"
              >
                <X size={18} />
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
                    value={servCategoriaId}
                    onChange={(e) => setServCategoriaId(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                    required
                  >
                    {categorias.length === 0 && (
                      <option value="">Nenhuma categoria cadastrada</option>
                    )}
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    {servSobConsulta ? "Preço (€)" : "Preço (€) *"}
                  </label>
                  <input
                    type="number"
                    required={!servSobConsulta}
                    min="0"
                    step="0.01"
                    placeholder={servSobConsulta ? "Não aplicável" : "Ex: 150.00"}
                    value={servSobConsulta ? "" : servPrice}
                    onChange={(e) => setServPrice(e.target.value)}
                    disabled={servSobConsulta}
                    className={`px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50 ${servSobConsulta ? "opacity-40 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Duração (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ex: 60"
                    value={servDuration}
                    onChange={(e) => setServDuration(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 cursor-pointer hover:bg-neutral-50 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={servSobConsulta}
                  onChange={(e) => {
                    setServSobConsulta(e.target.checked);
                    if (e.target.checked) setServPrice("");
                  }}
                  className="w-4 h-4 rounded accent-[#C49A82] cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-neutral-700">Preço sob consulta</span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">O preço não será exibido ao cliente. Será mostrado &quot;Sob Consulta&quot;.</p>
                </div>
              </label>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva brevemente o procedimento..."
                  value={servDescription}
                  onChange={(e) => setServDescription(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                  Foto do Serviço
                </label>
                <div className="flex items-center gap-4 p-4 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                  {/* Preview Box */}
                  <div className="w-16 h-16 rounded-xl border border-neutral-200 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group shadow-sm">
                    {servFotoUrl ? (
                      <>
                        <img
                          src={servFotoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setServFotoUrl("")}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white rounded-xl cursor-pointer"
                          title="Remover foto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <Camera size={20} className="text-neutral-400" />
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer w-fit shadow-sm hover:border-neutral-300">
                      <Upload size={13} className="text-neutral-500" />
                      {uploading ? "Enviando..." : "Selecionar Foto"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-neutral-400">
                      PNG, JPG ou WEBP. Máximo de 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {modalError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-sm">
                  <AlertTriangle size={15} />
                  {modalError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  style={{ background: ACCENT }}
                >
                  {modalLoading ? "Salvando..." : editingService ? "Atualizar" : "Criar Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CATEGORY CREATION / EDITION ── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2
                className="text-xl text-foreground font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Tratamentos Faciais, Massagens, etc."
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-[#C49A82] focus:ring-1 focus:ring-[#C49A82] text-sm text-neutral-800 transition-colors"
                />
              </div>

              {categoryModalError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-sm">
                  <AlertTriangle size={15} />
                  {categoryModalError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={categoryModalLoading}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  style={{ background: ACCENT }}
                >
                  {categoryModalLoading ? "Salvando..." : editingCategory ? "Atualizar" : "Criar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PROFESSIONAL CREATION / EDITION ── */}
      {isProModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2
                className="text-xl text-foreground font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {editingPro ? "Editar Profissional" : "Cadastrar Novo Profissional"}
              </h2>
              <button
                onClick={() => setIsProModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePro} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    value={proName}
                    onChange={(e) => setProName(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: joao@email.com"
                    value={proEmail}
                    onChange={(e) => setProEmail(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Telemóvel / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 912345678"
                    value={proPhone}
                    onChange={(e) => setProPhone(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    Categoria / Cargo *
                  </label>
                  <select
                    value={proCategoria}
                    onChange={(e) => setProCategoria(e.target.value as any)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-neutral-50/50"
                    required
                  >
                    <option value="funcionario">Funcionário</option>
                    <option value="dono">Proprietário / Dono</option>
                    <option value="desenvolvedor">Desenvolvedor</option>
                  </select>
                </div>
              </div>





              {proModalError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-sm">
                  <AlertTriangle size={15} />
                  {proModalError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={proModalLoading}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  style={{ background: ACCENT }}
                >
                  {proModalLoading ? "Salvando..." : editingPro ? "Atualizar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CUSTOM CONFIRMATION ── */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Content */}
            <div className="p-6 text-center space-y-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: confirmModalColor === "rose" ? "#FEE2E2" : ACCENT_LIGHT,
                  color: confirmModalColor === "rose" ? "#EF4444" : ACCENT,
                }}
              >
                {confirmModalColor === "rose" ? (
                  <Trash2 size={22} />
                ) : (
                  <RefreshCw size={22} />
                )}
              </div>
              <div className="space-y-2">
                <h3
                  className="text-lg text-neutral-800 font-semibold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {confirmModalTitle}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed px-2">
                  {confirmModalText}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 rounded-full text-sm font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (confirmModalAction) {
                    await confirmModalAction();
                  }
                  setIsConfirmModalOpen(false);
                }}
                className="flex-1 py-3 rounded-full text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 active:scale-95 cursor-pointer"
                style={{
                  background: confirmModalColor === "rose" ? "#EF4444" : ACCENT,
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: APPOINTMENT DETAILS ── */}
      {selectedApptDetails && (
        <div
          onClick={() => { setSelectedApptDetails(null); setIsRescheduling(false); }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2
                  className="text-xl text-foreground font-semibold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Detalhes do Agendamento
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Informações completas do cliente e do serviço agendado
                </p>
              </div>
              <button
                onClick={() => { setSelectedApptDetails(null); setIsRescheduling(false); }}
                className="text-neutral-400 hover:text-neutral-700 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Cliente Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-neutral-800 font-semibold border-b border-neutral-100 pb-1.5">
                  <User size={16} className="text-[#C49A82]" />
                  <h3 className="text-sm uppercase tracking-wider text-neutral-700">Dados do Cliente</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Nome</span>
                    <p className="text-sm font-semibold text-neutral-800">{selectedApptDetails.paciente?.nome || "Cliente"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Telefone / Telemóvel</span>
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                      {selectedApptDetails.paciente?.telefone ? (
                        <>
                          <a
                            href={`tel:${selectedApptDetails.paciente.telefone}`}
                            className="hover:underline flex items-center gap-1 text-neutral-800"
                          >
                            <Phone size={12} className="text-neutral-400" />
                            {selectedApptDetails.paciente.telefone}
                          </a>
                          <a
                            href={getWhatsAppLink(selectedApptDetails.paciente.telefone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle size={12} />
                          </a>
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">E-mail</span>
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Mail size={12} className="text-neutral-400" />
                      {selectedApptDetails.paciente?.email || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Agendamento Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-neutral-800 font-semibold border-b border-neutral-100 pb-1.5">
                  <Scissors size={16} className="text-[#C49A82]" />
                  <h3 className="text-sm uppercase tracking-wider text-neutral-700">Detalhes do Agendamento</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Serviço</span>
                    <p className="text-sm font-semibold text-neutral-800">{selectedApptDetails.servico?.nome || "Serviço"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Data</span>
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Calendar size={12} className="text-neutral-400" />
                      {new Date(selectedApptDetails.inicio).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Lisbon" })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Horário</span>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                        <Clock size={12} className="text-neutral-400" />
                        {formatTime(selectedApptDetails.inicio)}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const currentStart = new Date(selectedApptDetails.inicio);
                          const parts = getLisbonDateParts(currentStart);
                          const pad = (n: number) => String(n).padStart(2, "0");
                          setRescheduleDate(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}`);
                          setRescheduleTime(`${pad(parts.hour)}:${pad(parts.minute)}`);
                          setRescheduleError(null);
                          setIsRescheduling(true);
                        }}
                        className="text-[10px] font-bold text-[#C49A82] hover:underline flex items-center gap-0.5 cursor-pointer ml-1.5"
                        title="Reagendar este horário"
                      >
                        <Edit size={11} />
                        Reagendar
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Preço</span>
                    <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1" style={{ color: ACCENT }}>
                      € {selectedApptDetails.servico?.preco ? Number(selectedApptDetails.servico.preco).toFixed(2) : "0.00"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Status Atual</span>
                    <div>
                      {(() => {
                        const displayStatus = STATUS_API_TO_DISPLAY[selectedApptDetails.status];
                        const cfg = STATUS_CONFIG[displayStatus];
                        const StatusIcon = cfg.icon;
                        return (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: cfg.bg, color: cfg.text }}
                          >
                            <StatusIcon size={10} />
                            {cfg.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rescheduling Form Panel */}
              {isRescheduling && (
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs uppercase tracking-wide">
                    <Calendar size={13} className="text-[#C49A82]" />
                    <span>Reagendar Agendamento</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-neutral-400">Nova Data</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-neutral-400">Novo Horário</label>
                      <input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-[#C49A82] bg-white"
                      />
                    </div>
                  </div>
                  {rescheduleError && (
                    <p className="text-[10px] text-rose-600 font-medium">{rescheduleError}</p>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 bg-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={rescheduleLoading}
                      onClick={handleConfirmReschedule}
                      className="px-4 py-1.5 rounded-full text-[11px] font-semibold text-white bg-[#C49A82] hover:bg-[#b58b73] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {rescheduleLoading ? "Salvando..." : "Confirmar Novo Horário"}
                    </button>
                  </div>
                </div>
              )}

              {/* Observações Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-neutral-800 font-semibold border-b border-neutral-100 pb-1.5">
                  <ClipboardList size={16} className="text-[#C49A82]" />
                  <h3 className="text-sm uppercase tracking-wider text-neutral-700">Observações do Cliente</h3>
                </div>
                {selectedApptDetails.observacao && selectedApptDetails.observacao.trim() !== "" ? (
                  <div
                    className="p-4 rounded-2xl border border-neutral-100 bg-[#FDFBF9] text-sm text-neutral-700 italic leading-relaxed"
                    style={{ borderLeft: `4px solid ${ACCENT}` }}
                  >
                    "{selectedApptDetails.observacao}"
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/30 text-xs text-neutral-400 text-center">
                    Nenhuma observação ou anotação fornecida.
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="px-6 py-4 border-t border-border bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              {/* Quick status controls */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block w-full sm:w-auto sm:inline-block mr-1.5 mb-1 sm:mb-0">
                  Alterar Status:
                </span>
                {[
                  { id: "pending", label: "Pendente", colorClass: "hover:bg-amber-100 text-amber-700 border-amber-200" },
                  { id: "confirmed", label: "Confirmar", colorClass: "hover:bg-emerald-100 text-emerald-700 border-emerald-200" },
                  { id: "done", label: "Concluir", colorClass: "hover:bg-neutral-200 text-neutral-700 border-neutral-300" },
                  { id: "cancelled", label: "Cancelar", colorClass: "hover:bg-rose-100 text-rose-700 border-rose-200" },
                ].map((st) => {
                  const isCurrent = STATUS_API_TO_DISPLAY[selectedApptDetails.status] === st.id;
                  const isUpdating = updatingStatusId === selectedApptDetails.id;
                  return (
                    <button
                      key={st.id}
                      disabled={isUpdating}
                      onClick={() => handleAppointmentStatus(selectedApptDetails.id, st.id as DisplayStatus)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${st.colorClass} ${
                        isCurrent ? "bg-white border-neutral-400 shadow-sm ring-1 ring-neutral-400/10" : "bg-white"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { setSelectedApptDetails(null); setIsRescheduling(false); }}
                className="px-5 py-2 rounded-full text-xs font-semibold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(openMenuId || openAppointmentMenuId) && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => { setOpenMenuId(null); setOpenAppointmentMenuId(null); }}
        />
      )}
    </div>
  );
}
