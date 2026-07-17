"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig, ACCENT, WHATSAPP_LINK, WHATSAPP_NUMERO, buildWhatsAppUrl, formatPhoneDisplay } from "@/config/constants";
import type { Category, Service } from "@/types";

// Helper to determine service image
function getServiceImage(
  name: string,
  categoryName: string,
  customUrl?: string | null,
) {
  if (customUrl) return customUrl;

  const n = name.toLowerCase();
  const cat = categoryName.toLowerCase();

  if (
    n.includes("pele") ||
    n.includes("limpeza") ||
    n.includes("facial") ||
    cat.includes("rosto")
  ) {
    return "https://images.unsplash.com/photo-1761718209708-9ab9ba1c7252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";
  }
  if (n.includes("peeling") || n.includes("diamante")) {
    return "https://images.unsplash.com/photo-1767360963892-3353defd6584?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";
  }
  if (
    n.includes("massagem") ||
    n.includes("relaxante") ||
    n.includes("drenagem") ||
    cat.includes("corpo")
  ) {
    return "https://images.unsplash.com/photo-1761819921158-c3fa28f39bf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";
  }

  return "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80";
}

export default function HomePage() {
  const router = useRouter();
  const { userProfile, signOut } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [configuracao, setConfiguracao] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load backend data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const resCategories = await fetch("/api/categorias");
        if (!resCategories.ok) throw new Error("Erro ao carregar categorias");
        const categoriesData = await resCategories.json();
        setCategories(categoriesData);

        const resServices = await fetch("/api/servicos?ativo=true");
        if (!resServices.ok) throw new Error("Erro ao carregar serviços");
        const servicesData = await resServices.json();
        setServices(servicesData);

        const resConfig = await fetch("/api/configuracoes");
        if (resConfig.ok) {
          const configData = await resConfig.json();
          setConfiguracao(configData);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao conectar com a API.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigate directly to scheduling page on card click
  const handleServiceClick = (serviceId: string) => {
    router.push(`/agendamento?servico=${serviceId}`);
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
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#FAF9F6" }}
    >
      {/* Header */}
      <AppHeader userProfile={userProfile} onSignOut={signOut} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 md:px-10">
        {errorMsg && (
          <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

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

        <div className="flex flex-col gap-16">
          {categories.map((category) => {
            const categoryServices = services.filter(
              (s) => s.categoria_id === category.id,
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
                      <div className="aspect-[16/9] w-full overflow-hidden relative">
                        <ImageWithFallback
                          src={getServiceImage(
                            service.nome,
                            category.nome,
                            service.foto_url,
                          )}
                          alt={service.nome}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <svg
                            className="w-4 h-4 text-neutral-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-neutral-800 group-hover:text-[#C49A82] transition-colors leading-tight">
                            {service.nome}
                          </h4>
                        </div>

                        <p className="text-sm text-neutral-500 line-clamp-2 mb-6 flex-1">
                          {service.descricao ||
                            "Nenhuma descrição fornecida."}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-0.5">
                              Preço
                            </span>
                            <span className="font-bold text-neutral-900">€ {service.preco}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-0.5">
                              Duração
                            </span>
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <Clock size={13} />
                              <span className="text-sm font-medium">
                                {service.duracao_minutos} min
                              </span>
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
            href={configuracao?.telefone ? buildWhatsAppUrl(configuracao.telefone) : WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm cursor-pointer text-white"
            style={{ background: "#25D366" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {configuracao?.telefone ? formatPhoneDisplay(configuracao.telefone) : WHATSAPP_NUMERO}
          </a>
        </div>
      </main>
    </div>
  );
}
