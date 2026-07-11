import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              AV
            </div>
            <span className="font-semibold text-lg tracking-tight">Agenda Virtual</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="#" className="text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Início
            </Link>
            <Link href="#" className="text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Meus Horários
            </Link>
            <Link href="#" className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              Nova Reserva
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Welcome Section */}
        <section className="flex flex-col items-start gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Bem-vindo à sua Agenda
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 max-w-2xl text-lg">
            Organize seus compromissos e gerencie seus horários com facilidade.
          </p>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Calendar Card Placeholder */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Visão Geral - Julho 2026</h2>
              <button className="text-sm px-3 py-1.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                Hoje
              </button>
            </div>
            <div className="flex-1 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-center min-h-[300px]">
              <p className="text-slate-400 dark:text-zinc-500 text-sm">
                [Componente de Calendário será implementado aqui]
              </p>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-semibold mb-2">Próximos Compromissos</h2>
            
            {/* Appointment Item */}
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-zinc-800">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">
                <span className="text-xs font-medium">JUL</span>
                <span className="text-lg font-bold leading-none">12</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-zinc-100">Reunião de Projeto</span>
                <span className="text-sm text-slate-500 dark:text-zinc-400">14:00 - 15:00</span>
              </div>
            </div>

            {/* Appointment Item */}
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-zinc-800">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                <span className="text-xs font-medium">JUL</span>
                <span className="text-lg font-bold leading-none">14</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-zinc-100">Consulta Médica</span>
                <span className="text-sm text-slate-500 dark:text-zinc-400">09:00 - 09:30</span>
              </div>
            </div>

            {/* Empty State / See all */}
            <button className="mt-auto pt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 w-full text-center">
              Ver todos os compromissos &rarr;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
