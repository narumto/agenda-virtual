import { useState } from "react";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Scissors,
  Search, // Adicionado
  Calendar, // Adicionado
} from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

const ACCENT = "#C49A82";
const BACKGROUND = "#FAF9F6"; 

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  image: string;
}

const ROSTO_SERVICES: Service[] = [
  {
    id: "r1",
    name: "Limpeza de Pele Profunda",
    duration: "90 min",
    price: "R$ 180",
    description: "Remoção de impurezas, cravos e células mortas, devolvendo o viço e a saúde da pele.",
    image: "https://images.unsplash.com/photo-1761718209708-9ab9ba1c7252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "r2",
    name: "Peeling de Diamante",
    duration: "45 min",
    price: "R$ 120",
    description: "Microesfoliação que auxilia na renovação celular e redução de manchas leves.",
    image: "https://images.unsplash.com/photo-1767360963892-3353defd6584?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "r3",
    name: "Revitalização Facial",
    duration: "60 min",
    price: "R$ 150",
    description: "Nutrição intensiva com ativos antioxidantes para uma pele luminosa e hidratada.",
    image: "https://images.unsplash.com/photo-1778330804164-2f6d5d3b16ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const CORPO_SERVICES: Service[] = [
  {
    id: "c1",
    name: "Drenagem Linfática",
    duration: "60 min",
    price: "R$ 140",
    description: "Reduz o inchaço e melhora a circulação através de manobras suaves e rítmicas.",
    image: "https://images.unsplash.com/photo-1761819921158-c3fa28f39bf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "c2",
    name: "Massagem Relaxante",
    duration: "50 min",
    price: "R$ 130",
    description: "Alívio de tensões musculares e promoção de bem-estar profundo com óleos essenciais.",
    image: "https://images.unsplash.com/photo-1739980737820-b6bb1a9b8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxhZXN0aGV0aWMlMjBza2luY2FyZSUyMHNwYSUyMGZhY2lhbCUyMG1hc3NhZ2V8ZW58MXx8fHwxNzgzOTgxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "c3",
    name: "Massagem Modeladora",
    duration: "60 min",
    price: "R$ 160",
    description: "Manobras vigorosas que auxiliam no contorno corporal e redução de medidas.",
    image: "https://images.unsplash.com/photo-1779117691346-5de09d89a73f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxMHx8YWVzdGhldGljJTIwc2tpbmNhcmUlMjBzcGAlMjBmYWNpYWwlMjBtYXNzYWdlfGVufDF8fHx8MTc4Mzk4MTU3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export default function App() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lógica de filtro unindo a barra de pesquisa nova com os arrays separados
  const filteredRosto = ROSTO_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCorpo = CORPO_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ 
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: BACKGROUND 
      }}
    >
      {/* ── Top Header (Recuperado da versão antiga) ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: ACCENT }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg leading-tight text-neutral-900" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                Agenda Virtual
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                Estética & Bem-estar
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-6 relative hidden sm:block">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Pesquisar procedimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-100/70 text-sm text-neutral-800 placeholder:text-neutral-500 border border-transparent focus:border-neutral-200 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Right side (Agendamentos e Perfil) */}
          <div className="shrink-0 flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              <Calendar size={18} />
              <span className="hidden md:inline">Meus Agendamentos</span>
            </button>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm"
              style={{ background: ACCENT }}
            >
              K
            </div>
          </div>

        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 md:px-10">
        
        {/* Barra de pesquisa mobile (Aparece só no celular) */}
        <div className="sm:hidden mb-8 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Pesquisar procedimentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-neutral-100 shadow-sm text-sm focus:outline-none"
          />
        </div>

        <div className="mb-12">
          <h2 
            className="text-4xl text-neutral-800 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nossos Serviços
          </h2>
          <p className="text-neutral-500 max-w-xl">
            Selecione o procedimento desejado para iniciar seu agendamento. Oferecemos tratamentos personalizados para sua beleza e saúde.
          </p>
        </div>

        {/* ── Se não encontrar nada na pesquisa ── */}
        {filteredRosto.length === 0 && filteredCorpo.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search size={32} className="text-neutral-300 mb-4" />
            <p className="text-neutral-500">Nenhum procedimento encontrado para "{searchQuery}"</p>
          </div>
        )}

        {/* ── Vertical Sections ── */}
        <div className="flex flex-col gap-16">
          
          {/* Section: Rosto */}
          {filteredRosto.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl text-neutral-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Rosto
                </h3>
                <div className="h-px flex-1 bg-neutral-200/60" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRosto.map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    isSelected={selectedService === service.id}
                    onSelect={() => setSelectedService(selectedService === service.id ? null : service.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section: Corpo */}
          {filteredCorpo.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl text-neutral-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Corpo
                </h3>
                <div className="h-px flex-1 bg-neutral-200/60" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCorpo.map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    isSelected={selectedService === service.id}
                    onSelect={() => setSelectedService(selectedService === service.id ? null : service.id)}
                  />
                ))}
              </div>
            </section>
          )}

        </div>

        {/* ── Bloco de Ajuda (Recuperado da versão antiga e adaptado) ── */}
        <div className="mt-20 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: "#F5EDE6" }}>
          <div>
            <h3 className="text-xl font-medium text-neutral-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Precisa de ajuda?
            </h3>
            <p className="text-sm text-neutral-600 max-w-md">
              Entre em contacto com a nossa equipa para tirar dúvidas sobre qual o melhor procedimento para o seu tipo de pele ou sobre nossos horários.
            </p>
          </div>
          <button 
            className="px-6 py-3 bg-white rounded-full text-sm font-semibold transition-transform hover:scale-105 active:scale-95 shrink-0 shadow-sm"
            style={{ color: ACCENT }}
          >
            Falar connosco →
          </button>
        </div>

      </main>

      {/* ── Floating Action Bar (Sticky Mobile/Bottom) ── */}
      {selectedService && (
        <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-4 duration-300 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100">
                <Scissors size={20} style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Serviço Selecionado</p>
                <p className="font-semibold text-neutral-800">
                  {[...ROSTO_SERVICES, ...CORPO_SERVICES].find(s => s.id === selectedService)?.name}
                </p>
              </div>
            </div>
            <button 
              className="px-8 py-3 rounded-full text-white font-medium transition-transform hover:scale-105 active:scale-95 shadow-md"
              style={{ background: ACCENT }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ 
  service, 
  isSelected, 
  onSelect 
}: { 
  service: Service; 
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div 
      onClick={onSelect}
      className={`group relative flex flex-col bg-white rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer ${
        isSelected 
          ? "border-[2px] ring-4 ring-[#C49A8215] shadow-md scale-[1.02]" 
          : "border-neutral-200 hover:border-[#C49A8280] hover:shadow-xl hover:-translate-y-1"
      }`}
      style={{ borderColor: isSelected ? ACCENT : undefined }}
    >
      {/* Service Image */}
      <div className="aspect-[16/9] w-full overflow-hidden relative">
        <ImageWithFallback
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-neutral-800 group-hover:text-[#C49A82] transition-colors leading-tight">
            {service.name}
          </h4>
          {isSelected && (
            <CheckCircle2 size={20} style={{ color: ACCENT }} className="animate-in zoom-in" />
          )}
        </div>
        
        <p className="text-sm text-neutral-500 line-clamp-2 mb-6 flex-1">
          {service.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-0.5">Preço</span>
            <span className="font-bold text-neutral-900">{service.price}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-0.5">Duração</span>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Clock size={13} />
              <span className="text-sm font-medium">{service.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
