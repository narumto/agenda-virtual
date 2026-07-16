"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Scissors,
  CalendarDays,
  Clock,
  Banknote,
  CheckCircle2,
  AlertCircle,
  User,
  LogOut,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";
import { WHATSAPP_LINK, WHATSAPP_NUMERO } from "@/config/constants";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const ACCENT = "#C49A82";
const ACCENT_LIGHT = "#F5EDE6";

export default function ConfirmacaoPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [dateDisplay, setDateDisplay] = useState("");
  const [timeDisplay, setTimeDisplay] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const [pacienteId, setPacienteId] = useState("");
  const [pacienteName, setPacienteName] = useState("");
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [saveAsDefaultPhone, setSaveAsDefaultPhone] = useState(true);

  useEffect(() => {
    const sId = localStorage.getItem("selected_service_id") || "";
    const sName = localStorage.getItem("selected_service_name") || "";
    const sPrice = localStorage.getItem("selected_service_price") || "";
    const dDisplay = localStorage.getItem("selected_date_display") || "";
    const tDisplay = localStorage.getItem("selected_time_display") || "";
    const sInicio = localStorage.getItem("selected_inicio") || "";
    const sFim = localStorage.getItem("selected_fim") || "";

    if (!sId || !dDisplay || !tDisplay || !sInicio) {
      router.push("/agendamento");
      return;
    }

    setServiceId(sId);
    setServiceName(sName);
    setServicePrice(sPrice);
    setDateDisplay(dDisplay);
    setTimeDisplay(tDisplay);
    setInicio(sInicio);
    setFim(sFim);

    const fetchUserProfile = async () => {
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
          setUserProfile({ nome: userName, foto_url: userFoto, role: "paciente" });
        } else {
          const res = await fetch("/api/profissionais/auth?t=" + Date.now(), { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              isPro = true;
              setUserProfile({
                nome: data.data.nome,
                foto_url: data.data.foto_url || "",
                role: "profissional",
              });
              setPacienteName(data.data.nome);
              setPacienteId("pro-preview-id");
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

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Erro ao obter perfil");
          setPacienteId(data.data.id);
          setPacienteName(data.data.nome);
          setClientPhone(data.data.telefone || "");
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

    fetchUserProfile();
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
    if (userProfile?.role === "profissional") {
      await fetch("/api/profissionais/auth", { method: "DELETE" });
      window.location.href = "/profissional/login";
    } else {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  const handleConfirm = async () => {
    if (userProfile?.role === "profissional") {
      setErrorMsg("Você está logado como profissional. Agendamentos reais só podem ser efetuados por clientes.");
      return;
    }
    if (userProfile?.role === "paciente" && !clientPhone.trim()) {
      setErrorMsg("Telemóvel / Telefone é obrigatório.");
      return;
    }
    if (!pacienteId || !serviceId || !inicio || !fim) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (userProfile?.role === "paciente" && saveAsDefaultPhone && clientPhone.trim()) {
        await fetch(`/api/pacientes/${pacienteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: pacienteName,
            telefone: clientPhone.trim(),
          }),
        });
      }

      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paciente_id: pacienteId,
          servico_id: serviceId,
          inicio,
          fim,
          status: "PENDENTE",
          observacao: `${notes.trim() || "Agendamento realizado pelo cliente"}${clientPhone.trim() ? `. Telemóvel: ${clientPhone.trim()}` : ""}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Falha ao registrar agendamento");

      setSuccess(true);
      ["selected_service_id", "selected_service_name", "selected_service_price",
        "selected_date_display", "selected_time_display", "selected_inicio", "selected_fim"]
        .forEach((k) => localStorage.removeItem(k));
    } catch (err: any) {
      setErrorMsg(err.message || "Erro interno de agendamento.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-4 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const Header = () => (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 md:px-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <div className="flex items-center gap-4">
          <button
            id="btn-back"
            onClick={() => router.push("/agendamento")}
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
          <span className="line-through opacity-40">Serviços</span>
          <ChevronRight size={11} className="opacity-40" />
          <span className="line-through opacity-40">Data &amp; Hora</span>
          <ChevronRight size={11} className="opacity-40" />
          <span className="font-semibold" style={{ color: ACCENT }}>Confirmação</span>
        </div>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            id="btn-avatar-menu"
            onClick={() => setDropdownOpen((p) => !p)}
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
  );

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md"
            style={{ background: ACCENT_LIGHT }}
          >
            <CheckCircle2 size={40} style={{ color: ACCENT }} />
          </div>
          <h1
            className="text-3xl text-[#2B2723] mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Agendamento Solicitado!
          </h1>
          <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
            Seu horário foi reservado com sucesso e está <span className="font-medium text-neutral-700">pendente de confirmação</span>. Obrigado, {pacienteName.split(" ")[0]}!
          </p>

          <div
            className="mt-8 rounded-2xl border border-neutral-100 bg-white shadow-sm px-8 py-5 text-sm space-y-2 text-left"
            style={{ minWidth: 280 }}
          >
            <div className="flex items-center gap-3">
              <Scissors size={14} style={{ color: ACCENT }} />
              <span className="font-semibold text-neutral-800">{serviceName}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-500">
              <CalendarDays size={14} style={{ color: ACCENT }} />
              <span>{dateDisplay}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-500">
              <Clock size={14} style={{ color: ACCENT }} />
              <span>{timeDisplay}</span>
            </div>
          </div>

          <div className="mt-6 max-w-sm w-full rounded-2xl border border-amber-100 bg-amber-50 px-6 py-4 text-left space-y-1">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
              <Banknote size={13} />
              Pagamento presencial
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">
              O pagamento é realizado <strong>diretamente no local</strong> no momento do atendimento. Não é necessário nenhum pagamento antecipado.
            </p>
          </div>

          <div className="mt-4 max-w-sm w-full rounded-2xl border border-neutral-100 bg-white shadow-sm px-6 py-4 text-left space-y-1">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Dúvidas?</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Fale diretamente com a nossa equipa pelo WhatsApp:
            </p>
            <a
              id="btn-whatsapp-success"
              href={config?.telefone ? `https://wa.me/${config.telefone.replace(/\D/g, "")}` : WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95 hover:brightness-105 shadow-sm"
              style={{ background: "#25D366" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {config?.telefone || WHATSAPP_NUMERO}
            </a>
          </div>

          <button
            onClick={() => router.push("/meus-agendamentos")}
            className="mt-6 text-sm font-medium transition-colors hover:opacity-70 cursor-pointer"
            style={{ color: ACCENT }}
          >
            Ver meus agendamentos →
          </button>
        </div>
      </div>
    );
  }

  const summaryItems = [
    { icon: Scissors, label: "Serviço", value: serviceName },
    { icon: CalendarDays, label: "Data", value: dateDisplay },
    { icon: Clock, label: "Horário", value: timeDisplay },
    { icon: Banknote, label: "Valor Total", value: `€ ${servicePrice}`, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Header />

      <div className="text-center pt-10 pb-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: ACCENT }}>
          Etapa 3 de 3
        </p>
        <h1
          className="text-3xl text-[#2B2723]"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Confirme o seu Agendamento
        </h1>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">

        <div className="rounded-3xl border border-neutral-200/60 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100" style={{ background: ACCENT_LIGHT }}>
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-0.5 font-semibold">
              Resumo do Agendamento
            </p>
            <p
              className="text-lg text-[#2B2723]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              {serviceName}
            </p>
          </div>

          <div className="divide-y divide-neutral-100">
            {summaryItems.map(({ icon: Icon, label, value, highlight }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: ACCENT_LIGHT }}
                >
                  <Icon size={14} style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-neutral-400 mb-0.5 uppercase tracking-wide font-semibold">{label}</p>
                  <p
                    className="text-sm font-medium truncate"
                    style={highlight
                      ? { color: ACCENT, fontFamily: "'Playfair Display', serif", fontSize: "1.05rem" }
                      : { color: "#2B2723" }
                    }
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Ao confirmar, você concorda com a nossa{" "}
              <button className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: ACCENT }}>
                política de cancelamento
              </button>
              . Cancelamentos com menos de 24h podem ter custo.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200/60 bg-white shadow-sm p-7 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: ACCENT }} />

          <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1 font-semibold">
            Seus Dados
          </p>
          <h2
            className="text-xl text-[#2B2723] mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Tudo certo para confirmar!
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Você está agendando como <span className="font-semibold text-neutral-700">{pacienteName}</span>. Se quiser, adicione uma observação.
          </p>

          {errorMsg && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-start gap-3 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 text-rose-500 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {userProfile?.role === "paciente" && (
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                Telemóvel / Telefone *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 912345678"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#C49A82] transition-colors"
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "")}
              />
              
              <label className="flex items-center gap-2.5 mt-2 text-xs text-neutral-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsDefaultPhone}
                  onChange={(e) => setSaveAsDefaultPhone(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C49A82] border-neutral-300 focus:ring-[#C49A82]"
                />
                <span>Salvar como telefone padrão na minha conta</span>
              </label>
            </div>
          )}

          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-xs font-medium text-neutral-700" style={{ letterSpacing: "0.02em" }}>
              Observações <span className="text-neutral-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              placeholder="Alguma informação adicional? Ex: preferência de horário, alergia a produtos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700 placeholder:text-neutral-400 resize-none transition-colors focus:outline-none focus:bg-white"
              style={{ lineHeight: "1.6" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "")}
            />
          </div>

          <button
            id="btn-confirm"
            onClick={handleConfirm}
            disabled={submitting || !pacienteId}
            className="w-full py-4 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:brightness-105 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md"
            style={{ background: ACCENT, letterSpacing: "0.03em" }}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={17} />
                <span>Confirmar Agendamento</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
