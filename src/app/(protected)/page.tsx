"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clock,
  User,
  LogOut,
  CalendarDays,
} from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/config/site";
import { WHATSAPP_LINK, WHATSAPP_NUMERO } from "@/config/constants";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

const ACCENT = "#C49A82";
const BACKGROUND = "#FAF9F6";

interface Category {
  id: string;
  nome: string;
}

interface Service {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string;
  duracao_minutos: number;
  preco: number;
  foto_url?: string | null;
}

export default function HomePage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic API State
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load backend data and Supabase user session
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // Fetch User Session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserProfile({
            nome: session.user.user_metadata?.full_name || "Usuário",
            foto_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
          });
        }

        // Fetch categories
        const resCategories = await fetch("/api/categorias");
        if (!resCategories.ok) throw new Error("Erro ao carregar categorias");
        const categoriesData = await resCategories.json();
        setCategories(categoriesData);

        // Fetch services
        const resServices = await fetch("/api/servicos?ativo=true");
        if (!resServices.ok) throw new Error("Erro ao carregar serviços");
        const servicesData = await resServices.json();
        setServices(servicesData);

      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao conectar com a API.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Navigate directly to scheduling page on card click
  const handleServiceClick = (serviceId: string) => {
    router.push(`/agendamento?servico=${serviceId}`);
  };

  // Helper to determine service image
  const getServiceImage = (name: string, categoryName: string, customUrl?: string | null) => {
    if (customUrl) return customUrl;

    const n = name.toLowerCase();
    const cat = categoryName.toLowerCase();

    if (n.includes("pele") || n.includes("limpeza") || n.includes("facial") || cat.includes("rosto")) {
      return "https://images.unsplash.com/photo-1761718209708-9ab9ba1c7252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";
    }
    if (n.includes("peeling") || n.includes("diamante")) {
      return "https://images.unsplash.com/photo-1767360963892-3353defd6584?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";
    }
    if (n.includes("massagem") || n.includes("relaxante") || n.includes("drenagem") || cat.includes("corpo")) {
      return "https://images.unsplash.com/photo-1761819921158-c3fa28f39bf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";
    }

    return "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-8 h-8 border-4 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: BACKGROUND,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: ACCENT }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1
                className="text-lg leading-tight text-neutral-900"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                }}
              >
                {siteConfig.name}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                Estética &amp; Bem-estar
              </p>
            </div>
          </div>

          {/* Avatar + Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              id="btn-avatar-menu"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-full cursor-pointer focus:outline-none group"
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
              {/* Small indicator dot */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white transition-colors ${dropdownOpen ? "bg-[#C49A82]" : "bg-emerald-400"}`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden animate-fade-in z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-neutral-50">
                  <p className="text-xs text-neutral-400 mb-0.5">Logado como</p>
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {userProfile?.nome || "Usuário"}
                  </p>
                </div>

                {/* Options */}
                <div className="py-1.5">
                  <button
                    id="dropdown-minha-conta"
                    onClick={() => { setDropdownOpen(false); router.push("/login"); }}
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

      {/* Main */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 md:px-10">

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Title */}
        <div className="mb-12">
          <h2
            className="text-4xl text-neutral-800 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nossos Serviços
          </h2>
          <p className="text-neutral-500 max-w-xl">
            Selecione o procedimento desejado para iniciar seu agendamento.
            Oferecemos tratamentos personalizados para sua beleza e saúde.
          </p>
        </div>

        {/* Categories Sections */}
        <div className="flex flex-col gap-16">
          {categories.map((category) => {
            const categoryServices = services.filter(
              (s) => s.categoria_id === category.id
            );

            if (categoryServices.length === 0) return null;

            return (
              <section key={category.id} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <h3
                    className="text-2xl text-neutral-800"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {category.nome}
                  </h3>
                  <div className="h-px flex-1 bg-neutral-200/60" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      id={`service-card-${service.id}`}
                      onClick={() => handleServiceClick(service.id)}
                      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-neutral-200 hover:border-[#C49A8280] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      {/* Image */}
                      <div className="aspect-[16/9] w-full overflow-hidden relative">
                        <ImageWithFallback
                          src={getServiceImage(service.nome, category.nome, service.foto_url)}
                          alt={service.nome}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {/* Arrow badge on hover */}
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-neutral-800 group-hover:text-[#C49A82] transition-colors leading-tight">
                            {service.nome}
                          </h4>
                        </div>

                        <p className="text-sm text-neutral-500 line-clamp-2 mb-6 flex-1">
                          {service.descricao || "Nenhuma descrição fornecida."}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-0.5">
                              Preço
                            </span>
                            <span className="font-bold text-neutral-900">R$ {service.preco}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-0.5">
                              Duração
                            </span>
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <Clock size={13} />
                              <span className="text-sm font-medium">{service.duracao_minutos} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Help block */}
        <div
          className="mt-20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "#F5EDE6" }}
        >
          <div>
            <h3
              className="text-xl font-medium text-neutral-900 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Precisa de ajuda?
            </h3>
            <p className="text-sm text-neutral-600 max-w-md">
              Entre em contato com a nossa equipe para tirar dúvidas sobre qual
              o melhor procedimento para o seu tipo de pele ou sobre nossos
              horários.
            </p>
          </div>
          <a
            id="btn-contact"
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm cursor-pointer text-white"
            style={{ background: "#25D366" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {WHATSAPP_NUMERO}
          </a>
        </div>
      </main>
    </div>
  );
}
